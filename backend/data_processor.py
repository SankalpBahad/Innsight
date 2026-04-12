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

    def get_matchups(self, player_name: str):
        player_df = self.df[self.df['bat'] == player_name]
        if player_df.empty:
            return None

        # Stats by bowl_kind (Pace/Spin only)
        matchups = []
        filtered_df = player_df[player_df['bowl_kind'].isin(['pace bowler', 'spin bowler'])]
        for kind, group in filtered_df.groupby('bowl_kind'):
            runs = int(group['batruns'].sum())
            balls = int(group['ballfaced'].sum())
            outs = int(group['is_out'].sum())
            sr = (runs / balls * 100) if balls > 0 else 0
            avg = (runs / outs) if outs > 0 else runs
            matchups.append({
                "type": kind,
                "runs": runs,
                "balls": balls,
                "outs": outs,
                "strike_rate": round(sr, 2),
                "average": round(avg, 2),
            })

        # Stats by bowl_style (pure styles only), sorted by balls faced
        style_df = player_df[~player_df['bowl_style'].isin(MIXED_STYLES)]
        by_style = []
        for style, group in style_df.groupby('bowl_style'):
            runs = int(group['batruns'].sum())
            balls = int(group['ballfaced'].sum())
            outs = int(group['is_out'].sum())
            sr = (runs / balls * 100) if balls > 0 else 0
            avg = (runs / outs) if outs > 0 else runs
            dismissal_rate = (outs / balls * 100) if balls > 0 else 0
            by_style.append({
                "style": style,
                "runs": runs,
                "balls": balls,
                "outs": outs,
                "strike_rate": round(sr, 2),
                "average": round(avg, 2),
                "dismissal_rate": round(dismissal_rate, 2)
            })
        by_style = sorted(by_style, key=lambda x: x['balls'], reverse=True)

        # Top 5 Bowlers by runs, with RHB/LHB career breakdown
        top_bowlers = []
        for bowler, group in player_df.groupby('bowl'):
            runs = int(group['batruns'].sum())
            balls = int(group['ballfaced'].sum())
            outs = int(group['is_out'].sum())
            sr = (runs / balls * 100) if balls > 0 else 0
            top_bowlers.append({
                "bowler": bowler,
                "runs": runs,
                "balls": balls,
                "outs": outs,
                "strike_rate": round(sr, 2)
            })

        top_bowlers = sorted(top_bowlers, key=lambda x: x['runs'], reverse=True)[:5]

        # Attach RHB/LHB career stats for each top bowler
        for b in top_bowlers:
            bowler_df = self.df[self.df['bowl'] == b['bowler']]
            vs_hand = {}
            for hand, hgroup in bowler_df[bowler_df['bat_hand'].isin(['RHB', 'LHB'])].groupby('bat_hand'):
                hballs = int(hgroup['ballfaced'].sum())
                hruns = int(hgroup['bowlruns'].sum())
                hwickets = int(hgroup['is_out'].sum())
                vs_hand[hand] = {
                    "runs_conceded": hruns,
                    "balls": hballs,
                    "wickets": hwickets,
                    "strike_rate": round(hruns / hballs * 100, 2) if hballs > 0 else 0,
                    "average": round(hruns / hwickets, 2) if hwickets > 0 else hruns,
                    "economy": round(hruns / hballs * 6, 2) if hballs > 0 else 0
                }
            b['vs_hand'] = vs_hand

        return {
            "by_type": matchups,
            "by_style": by_style,
            "top_bowlers": top_bowlers
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
