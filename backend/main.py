from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_processor import DataProcessor
import os

app = FastAPI(title="CricInsight API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
csv_path = os.path.join(os.path.dirname(__file__), "..", "t20_bbb_ipl.csv")
processor = DataProcessor(csv_path)

@app.get("/")
async def root():
    return {"message": "CricInsight API is running"}

@app.get("/players")
async def get_players():
    return processor.get_player_names()

@app.get("/player/{name}/career")
async def get_career(name: str):
    stats = processor.get_career_stats(name)
    if not stats:
        raise HTTPException(status_code=404, detail="Player not found")
    return stats

@app.get("/player/{name}/matchups")
async def get_matchups(name: str):
    matchups = processor.get_matchups(name)
    if not matchups:
        raise HTTPException(status_code=404, detail="Player not found")
    return matchups

@app.get("/player/{name}/dismissals")
async def get_dismissals(name: str):
    dismissals = processor.get_dismissals(name)
    if not dismissals:
        return []
    return dismissals

@app.get("/player/{name}/zones")
async def get_zones(name: str):
    zones = processor.get_zones(name)
    if not zones:
        return []
    return zones

@app.get("/player/{name}/wicket-shots")
async def get_wicket_shots(name: str):
    data = processor.get_wicket_shots(name)
    if not data:
        raise HTTPException(status_code=404, detail="Player not found")
    return data

@app.get("/player/{name}/graph")
async def get_graph(name: str):
    return processor.get_graph_data(name)

import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=10000)