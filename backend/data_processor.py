import pandas as pd
import numpy as np

MIXED_STYLES = {'-', 'OB/LB', 'RM/OB', 'SLA/LWS', 'RM/OB/LB', 'OB/LBG', 'OB/SLA'}

class DataProcessor:
    def __init__(self, csv_path: str):
        self.df = pd.read_csv(csv_path)
        self._preprocess()

    def _preprocess(self):
        # Ensure numeric types
        self.df['batruns'] = pd.to_numeric(self.df['batruns'], errors='coerce').fillna(0)
        self.df['ballfaced'] = pd.to_numeric(self.df['ballfaced'], errors='coerce').fillna(0)
        self.df['bowlruns'] = pd.to_numeric(self.df['bowlruns'], errors='coerce').fillna(0)

        # Flags for boundaries
        self.df['is_four'] = (self.df['batruns'] == 4).astype(int)
        self.df['is_six'] = (self.df['batruns'] == 6).astype(int)

        # Identify dismissals - 'out' is the correct flag for wicket falling
        self.df['is_out'] = pd.to_numeric(self.df['out'], errors='coerce').fillna(0).astype(int)

    def get_player_names(self):
        return sorted(self.df['bat'].unique().tolist())

    def get_career_stats(self, player_name: str):
        player_df = self.df[self.df['bat'] == player_name]

        if player_df.empty:
            return None

        runs = int(player_df['batruns'].sum())
        balls = int(player_df['ballfaced'].sum())
        fours = int(player_df['is_four'].sum())
        sixes = int(player_df['is_six'].sum())
        outs = int(player_df['is_out'].sum())

        strike_rate = (runs / balls * 100) if balls > 0 else 0
        average = (runs / outs) if outs > 0 else runs

        return {
            "name": player_name,
            "runs": runs,
            "balls": balls,
            "fours": fours,
            "sixes": sixes,
            "strike_rate": round(strike_rate, 2),
            "average": round(average, 2),
            "matches": int(player_df['p_match'].nunique())
        }

    def _batter_score(self, sr, dismissal_rate):
        """Composite: high SR + low dismissal rate = good"""
        return sr - (dismissal_rate * 15)

    def _bowler_score(self, economy, balls, wickets):
        """Composite: low economy + high wicket rate = good"""
        wicket_rate = (wickets / balls * 500) if balls > 0 else 0
        return -economy + wicket_rate

    def get_matchups(self, player_name: str):
        MIN_BALLS_BOWLER = 12
        MIN_BALLS_STYLE  = 18

        # ── AS BATTER ──────────────────────────────────────────────
        player_df = self.df[self.df['bat'] == player_name]

        # Stats by bowl_kind (Pace/Spin only)
        by_type = []
        filtered_df = player_df[player_df['bowl_kind'].isin(['pace bowler', 'spin bowler'])]
        for kind, group in filtered_df.groupby('bowl_kind'):
            runs  = int(group['batruns'].sum())
            balls = int(group['ballfaced'].sum())
            outs  = int(group['is_out'].sum())
            sr    = (runs / balls * 100) if balls > 0 else 0
            avg   = (runs / outs) if outs > 0 else runs
            by_type.append({"type": kind, "runs": runs, "balls": balls,
                            "outs": outs, "strike_rate": round(sr, 2), "average": round(avg, 2)})

        # Stats by bowl_style
        style_df = player_df[~player_df['bowl_style'].isin(MIXED_STYLES)]
        by_style = []
        for style, group in style_df.groupby('bowl_style'):
            runs  = int(group['batruns'].sum())
            balls = int(group['ballfaced'].sum())
            outs  = int(group['is_out'].sum())
            sr    = (runs / balls * 100) if balls > 0 else 0
            avg   = (runs / outs) if outs > 0 else runs
            dr    = (outs / balls * 100) if balls > 0 else 0
            by_style.append({"style": style, "runs": runs, "balls": balls, "outs": outs,
                             "strike_rate": round(sr, 2), "average": round(avg, 2),
                             "dismissal_rate": round(dr, 2)})
        by_style = sorted(by_style, key=lambda x: x['balls'], reverse=True)

        # All bowlers with min balls — good/bad splits
        bowler_rows = []
        for bowler, group in player_df.groupby('bowl'):
            balls = int(group['ballfaced'].sum())
            if balls < MIN_BALLS_BOWLER:
                continue
            runs = int(group['batruns'].sum())
            outs = int(group['is_out'].sum())
            sr   = round(runs / balls * 100, 2) if balls > 0 else 0
            avg  = round(runs / outs, 2) if outs > 0 else runs
            dr   = round(outs / balls * 100, 2) if balls > 0 else 0
            bowler_rows.append({"bowler": bowler, "runs": runs, "balls": balls,
                                "outs": outs, "strike_rate": sr, "average": avg,
                                "dismissal_rate": dr,
                                "_score": self._batter_score(sr, dr)})

        bowler_rows.sort(key=lambda x: x['_score'], reverse=True)
        strip = lambda rows: [{k: v for k, v in r.items() if k != '_score'} for r in rows]
        good_vs_bowlers = strip(bowler_rows[:10])
        bad_vs_bowlers  = strip(list(reversed(bowler_rows[-10:])))

        # Good/bad bowling styles (min balls)
        style_rows = [s for s in by_style if s['balls'] >= MIN_BALLS_STYLE]
        style_rows.sort(key=lambda x: self._batter_score(x['strike_rate'], x['dismissal_rate']), reverse=True)
        good_vs_styles = style_rows[:5]
        bad_vs_styles  = list(reversed(style_rows[-5:]))

        # ── AS BOWLER ──────────────────────────────────────────────
        bowl_df = self.df[self.df['bowl'] == player_name]
        bowler_section = {}

        if not bowl_df.empty:
            batter_rows = []
            for batter, group in bowl_df.groupby('bat'):
                balls = int(group['ballfaced'].sum())
                if balls < MIN_BALLS_BOWLER:
                    continue
                runs     = int(group['bowlruns'].sum())
                wickets  = int(group['is_out'].sum())
                economy  = round(runs / balls * 6, 2) if balls > 0 else 0
                sr       = round(runs / balls * 100, 2) if balls > 0 else 0
                avg      = round(runs / wickets, 2) if wickets > 0 else runs
                batter_rows.append({"batter": batter, "runs_conceded": runs, "balls": balls,
                                    "wickets": wickets, "economy": economy,
                                    "strike_rate": sr, "average": avg,
                                    "_score": self._bowler_score(economy, balls, wickets)})

            batter_rows.sort(key=lambda x: x['_score'], reverse=True)
            bowler_section['good_vs_batters'] = strip(batter_rows[:10])
            bowler_section['bad_vs_batters']  = strip(list(reversed(batter_rows[-10:])))

            vs_hand = {}
            for hand, hgroup in bowl_df[bowl_df['bat_hand'].isin(['RHB', 'LHB'])].groupby('bat_hand'):
                hb = int(hgroup['ballfaced'].sum())
                hr = int(hgroup['bowlruns'].sum())
                hw = int(hgroup['is_out'].sum())
                vs_hand[hand] = {
                    "runs_conceded": hr, "balls": hb, "wickets": hw,
                    "strike_rate": round(hr / hb * 100, 2) if hb > 0 else 0,
                    "average":     round(hr / hw, 2) if hw > 0 else hr,
                    "economy":     round(hr / hb * 6, 2) if hb > 0 else 0,
                }
            bowler_section['vs_hand'] = vs_hand

        return {
            "by_type":         by_type,
            "by_style":        by_style,
            "batter": {
                "good_vs_bowlers": good_vs_bowlers,
                "bad_vs_bowlers":  bad_vs_bowlers,
                "good_vs_styles":  good_vs_styles,
                "bad_vs_styles":   bad_vs_styles,
            },
            "bowler": bowler_section,
        }

    def get_dismissals(self, player_name: str):
        player_df = self.df[self.df['bat'] == player_name]
        if player_df.empty:
            return None

        dismissals = player_df[player_df['is_out'] == 1]
        types = dismissals['dismissal'].value_counts().to_dict()
        return [{"type": k, "count": int(v)} for k, v in types.items()]

    def get_zones(self, player_name: str):
        player_df = self.df[self.df['bat'] == player_name]
        if player_df.empty:
            return None

        zones = player_df.groupby('wagonZone')['batruns'].sum().to_dict()
        zone_list = [{"zone": k, "runs": int(v)} for k, v in zones.items()]

        # Individual ball coordinates for wagon wheel rendering
        wagon_df = player_df[
            (pd.to_numeric(player_df['wagonX'], errors='coerce').fillna(0) != 0) &
            (pd.to_numeric(player_df['wagonY'], errors='coerce').fillna(0) != 0)
        ][['wagonX', 'wagonY', 'batruns']].dropna().copy()

        wagon_df['wagonX'] = pd.to_numeric(wagon_df['wagonX'], errors='coerce')
        wagon_df['wagonY'] = pd.to_numeric(wagon_df['wagonY'], errors='coerce')
        balls = wagon_df.to_dict('records')

        if len(balls) > 500:
            import random
            random.seed(42)
            balls = random.sample(balls, 500)

        return {
            "zones": zone_list,
            "balls": [{"x": int(b['wagonX']), "y": int(b['wagonY']), "runs": int(b['batruns'])} for b in balls]
        }

    def get_wpa(self, player_name: str):
        player_df = self.df[self.df['bat'] == player_name].copy()
        if player_df.empty:
            return None

        wprob = pd.to_numeric(player_df['wprob'], errors='coerce')
        player_df['wprob_num'] = wprob

        # WPA = change in win probability ball-to-ball within same match+innings
        player_df = player_df.sort_values(['p_match', 'inns', 'ball'])
        player_df['wpa'] = player_df.groupby(['p_match', 'inns'])['wprob_num'].diff()
        player_df['wpa'] = player_df['wpa'].fillna(0)

        total_wpa = round(float(player_df['wpa'].sum()), 2)

        # Clutch: WPA when team win prob < 30
        clutch = player_df[player_df['wprob_num'] < 30]['wpa']
        clutch_wpa = round(float(clutch.sum()), 2)

        # Per match WPA
        per_match = player_df.groupby('p_match')['wpa'].sum().reset_index()
        per_match.columns = ['match', 'wpa']
        per_match = per_match.sort_values('wpa', ascending=False)
        top_matches = per_match.head(5).to_dict('records')

        # WPA by phase
        over_col = pd.to_numeric(player_df['over'], errors='coerce')
        phase_wpa = {}
        for phase, mask in [('Powerplay', over_col <= 6), ('Middle', (over_col > 6) & (over_col <= 15)), ('Death', over_col > 15)]:
            phase_wpa[phase] = round(float(player_df[mask]['wpa'].sum()), 2)

        return {
            "total_wpa": total_wpa,
            "clutch_wpa": clutch_wpa,
            "phase_wpa": phase_wpa,
            "top_matches": [{"match": int(m['match']), "wpa": round(float(m['wpa']), 2)} for m in top_matches],
        }

    def get_phase_stats(self, player_name: str):
        player_df = self.df[self.df['bat'] == player_name]
        if player_df.empty:
            return None

        over_col = pd.to_numeric(player_df['over'], errors='coerce')
        conditions = [over_col <= 6, (over_col > 6) & (over_col <= 15), over_col > 15]
        labels = ['Powerplay', 'Middle', 'Death']

        phases = []
        for label, mask in zip(labels, conditions):
            group = player_df[mask]
            runs = int(group['batruns'].sum())
            balls = int(group['ballfaced'].sum())
            outs = int(group['is_out'].sum())
            fours = int(group['is_four'].sum())
            sixes = int(group['is_six'].sum())
            sr = round(runs / balls * 100, 2) if balls > 0 else 0
            avg = round(runs / outs, 2) if outs > 0 else runs
            dot_balls = int((group['batruns'] == 0).sum())
            dot_pct = round(dot_balls / balls * 100, 2) if balls > 0 else 0
            boundary_pct = round((fours + sixes) / balls * 100, 2) if balls > 0 else 0
            phases.append({
                "phase": label,
                "runs": runs,
                "balls": balls,
                "outs": outs,
                "fours": fours,
                "sixes": sixes,
                "strike_rate": sr,
                "average": avg,
                "dot_pct": dot_pct,
                "boundary_pct": boundary_pct,
            })
        return phases

    def get_wicket_shots(self, player_name: str):
        player_df = self.df[self.df['bat'] == player_name]
        if player_df.empty:
            return None

        dismissals = player_df[
            (player_df['is_out'] == 1) &
            (player_df['shot'].notna()) &
            (player_df['shot'] != '') &
            (~player_df['bowl_style'].isin(MIXED_STYLES)) &
            (player_df['bowl_style'] != '')
        ]

        # shot × bowl_style dismissal counts
        heatmap = dismissals.groupby(['shot', 'bowl_style']).size().reset_index(name='count')
        heatmap_list = heatmap.to_dict('records')

        # Top dismissal shots overall
        by_shot = dismissals['shot'].value_counts().head(10).to_dict()
        shot_list = [{"shot": k, "count": int(v)} for k, v in by_shot.items()]

        # Top dismissal bowl styles
        by_style = dismissals['bowl_style'].value_counts().to_dict()
        style_list = [{"style": k, "count": int(v)} for k, v in by_style.items()]

        return {
            "heatmap": heatmap_list,
            "by_shot": shot_list,
            "by_style": style_list
        }

    def get_graph_data(self, player_name: str):
        player_df = self.df[self.df['bat'] == player_name]
        if player_df.empty:
            return {"nodes": [], "links": []}

        # Top 15 interaction (more for a graph)
        bowlers = player_df.groupby('bowl')['ballfaced'].sum().sort_values(ascending=False).head(15)

        nodes = [{"id": player_name, "type": "player"}]
        links = []

        for bowler, balls in bowlers.items():
            nodes.append({"id": bowler, "type": "bowler"})
            links.append({"source": player_name, "target": bowler, "weight": int(balls)})

        return {"nodes": nodes, "links": links}
