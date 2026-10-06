"""
FastAPI server for Railway DSS - Python component
Handles simulation, DRL predictions, and real-time data streaming
"""

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
import json
import numpy as np
from datetime import datetime

from src.digital_twin.simulator import DigitalTwin, Train
from src.drl_agent.controller import MultiAgentDRLController, ConflictResolver

# Initialize FastAPI app
app = FastAPI(
    title="Railway DSS - Python Backend",
    description="ML & Simulation Engine for Railway Decision Support",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
digital_twin: Optional[DigitalTwin] = None
drl_controller: Optional[MultiAgentDRLController] = None
conflict_resolver: Optional[ConflictResolver] = None
simulation_running = False
simulation_speed = 1.0

# Data models
class TrainInput(BaseModel):
    id: str
    position: float
    speed: float
    destination: str
    priority: str = "normal"

class SimulationConfig(BaseModel):
    track_length_km: float = 100.0
    num_segments: int = 10
    num_trains: int = 15
    disruption: Optional[str] = None

class ScenarioCreate(BaseModel):
    name: str
    description: str
    num_trains: int
    disruption: Optional[str] = None

class ActionInput(BaseModel):
    train_actions: List[float]
    train_positions: List[float]
    train_speeds: List[float]

# Routes

@app.on_event("startup")
async def startup_event():
    """Initialize system on startup"""
    global digital_twin, drl_controller, conflict_resolver
    
    print("Initializing Railway DSS System...")
    
    digital_twin = DigitalTwin(track_length_km=100.0, num_segments=10)
    digital_twin.create_scenario(num_trains=15)
    
    drl_controller = MultiAgentDRLController(num_trains=15, model_name="ppo")
    conflict_resolver = ConflictResolver(safety_buffer_m=500.0)
    
    print("✓ System initialized successfully")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "digital_twin": digital_twin is not None,
            "drl_controller": drl_controller is not None,
            "conflict_resolver": conflict_resolver is not None
        }
    }

@app.get("/api/v1/state")
async def get_current_state():
    """Get current simulation state"""
    if digital_twin is None:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    return {
        "timestamp": datetime.now().isoformat(),
        "simulation_state": digital_twin.get_state()
    }

@app.post("/api/v1/simulation/init")
async def initialize_simulation(config: SimulationConfig):
    """Initialize new simulation scenario"""
    global digital_twin, drl_controller, conflict_resolver

    try:
        digital_twin = DigitalTwin(
            track_length_km=config.track_length_km,
            num_segments=config.num_segments
        )
        digital_twin.create_scenario(
            num_trains=config.num_trains,
            disruption=config.disruption
        )

        # Initialize DRL and Safety layer
        drl_controller = MultiAgentDRLController(num_trains=config.num_trains)
        conflict_resolver = ConflictResolver(safety_buffer_m=500.0)        
        return {
            "status": "success",
            "message": f"Simulation initialized with {config.num_trains} trains",
            "state": digital_twin.get_state()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/simulation/step")
async def simulation_step():
    """Execute one simulation step"""
    if digital_twin is None:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    digital_twin.step()
    return digital_twin.get_state()

@app.post("/api/v1/simulation/run")
async def run_simulation(steps: int = 100):
    """Run simulation for N steps"""
    if digital_twin is None:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    global simulation_running
    simulation_running = True
    
    try:
        for i in range(steps):
            if not simulation_running:
                break
            digital_twin.step()
            await asyncio.sleep(0.01 / simulation_speed)
        
        return {
            "status": "success",
            "steps_completed": steps,
            "final_state": digital_twin.get_state()
        }
    finally:
        simulation_running = False

@app.post("/api/v1/simulation/stop")
async def stop_simulation():
    """Stop running simulation"""
    global simulation_running
    simulation_running = False
    return {"status": "stopped", "state": digital_twin.get_state()}

@app.post("/api/v1/simulation/resolve")
async def resolve_disruption(segment_id: Optional[str] = None):
    """Resolve conflicts/disruptions in the simulation"""
    if digital_twin is None:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    digital_twin.clear_conflicts(segment_id)
    return {
        "status": "success",
        "message": f"Disruption resolved for {segment_id if segment_id else 'all segments'}",
        "state": digital_twin.get_state()
    }

@app.post("/api/v1/train/add")
async def add_train(train_input: TrainInput):
    """Add a new train to simulation"""
    if digital_twin is None:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    try:
        train = Train(
            id=train_input.id,
            position=train_input.position,
            speed=train_input.speed,
            destination=train_input.destination,
            priority=train_input.priority
        )
        digital_twin.add_train(train)
        
        return {
            "status": "success",
            "message": f"Train {train_input.id} added successfully",
            "train": train.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/v1/train/{train_id}")
async def remove_train(train_id: str):
    """Remove a train from simulation"""
    if digital_twin is None:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    digital_twin.remove_train(train_id)
    return {
        "status": "success",
        "message": f"Train {train_id} removed successfully"
    }

@app.get("/api/v1/drl/predict")
async def drl_predict():
    """Get DRL model predictions for current state"""
    if drl_controller is None or digital_twin is None:
        raise HTTPException(status_code=503, detail="DRL system not initialized")
    
    try:
        # Get current state as observations
        state = digital_twin.get_state()
        obs = np.zeros(drl_controller.num_trains * 2 + 10)
        
        # Populate observations from current state
        for i, train in enumerate(state["trains"][:drl_controller.num_trains]):
            obs[i] = train["position"] / digital_twin.track_length
            obs[drl_controller.num_trains + i] = train["speed"] / 120.0
        
        # Get DRL predictions
        actions = drl_controller.predict_actions(obs)
        
        # Apply conflict resolution
        positions = [t["position"] for t in state["trains"]]
        speeds = [t["speed"] for t in state["trains"]]
        
        safe_actions = conflict_resolver.resolve_conflicts(
            actions, positions, speeds
        )
        
        return {
            "drl_actions": actions.tolist(),
            "safe_actions": safe_actions.tolist(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/drl/train")
async def train_drl_model(steps: int = 10000):
    """Train DRL model (long-running operation)"""
    if drl_controller is None:
        raise HTTPException(status_code=503, detail="DRL system not initialized")
    
    try:
        drl_controller.train(total_timesteps=steps)
        metrics = drl_controller.evaluate(num_episodes=5)
        
        return {
            "status": "success",
            "message": f"Model trained for {steps} steps",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/drl/resolve-conflicts")
async def resolve_conflicts(action_input: ActionInput):
    """Apply conflict resolution rules to DRL actions"""
    if conflict_resolver is None:
        raise HTTPException(status_code=503, detail="Conflict resolver not initialized")
    
    try:
        actions = np.array(action_input.train_actions)
        safe_actions = conflict_resolver.resolve_conflicts(
            actions,
            action_input.train_positions,
            action_input.train_speeds
        )
        
        return {
            "original_actions": action_input.train_actions,
            "safe_actions": safe_actions.tolist(),
            "conflicts_detected": conflict_resolver.check_conflict(action_input.train_positions)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/v1/metrics")
async def get_metrics():
    """Get system-wide performance metrics"""
    if digital_twin is None:
        raise HTTPException(status_code=503, detail="Simulation not initialized")
    
    state = digital_twin.get_state()
    metrics = state.get("metrics", {})
    
    return {
        "timestamp": datetime.now().isoformat(),
        "metrics": metrics
    }

@app.get("/api/v1/status")
async def get_system_status():
    """Get overall system status"""
    return {
        "timestamp": datetime.now().isoformat(),
        "status": "operational",
        "simulation_running": simulation_running,
        "simulation_speed_multiplier": simulation_speed,
        "components_initialized": {
            "digital_twin": digital_twin is not None,
            "drl_controller": drl_controller is not None,
            "conflict_resolver": conflict_resolver is not None
        }
    }

@app.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):
    """WebSocket connection for real-time simulation updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send current state every 500ms
            if digital_twin is not None:
                state = digital_twin.get_state()
                await websocket.send_json(state)
            
            await asyncio.sleep(0.5)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# Root endpoint
@app.get("/")
async def root():
    """API root"""
    return {
        "service": "Railway DSS - Python Backend",
        "version": "1.0.0",
        "description": "Digital Twin Simulator & DRL Agent",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=False
    )
