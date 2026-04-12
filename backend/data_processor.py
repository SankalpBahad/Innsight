import pandas as pd
import numpy as np

class DataProcessor:
    def __init__(self, csv_path: str):
        self.df = pd.read_csv(csv_path)
        self._preprocess()

    def _preprocess(self):
        # Ensure numeric types
        self.df['batruns'] = pd.to_numeric(self.df['batruns'], errors='coerce').fillna(0)
        self.df['ballfaced'] = pd.to_numeric(self.df['ballfaced'], errors='coerce').fillna(0)
        
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
            matchups.append({
                "type": kind,
                "runs": runs,
                "balls": balls,
                "outs": outs,
                "strike_rate": round(sr, 2)
            })

        # Top 5 Bowlers by runs
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

        return {
            "by_type": matchups,
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
        return [{"zone": k, "runs": int(v)} for k, v in zones.items()]

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
