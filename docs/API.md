# Railway DSS - REST API Reference

## Base URLs

- **Java Backend**: `http://localhost:8080/api/v1`
- **Python Backend**: `http://localhost:8000/api/v1`

## Authentication

Currently, no authentication required (default). For production, implement:
```
Authorization: Bearer <token>
```

## Response Format

All responses are JSON with standard format:
```json
{
  "status": "success|error",
  "message": "Optional message",
  "data": {},
  "timestamp": "2026-03-18T10:30:00Z"
}
```

---

## Java Backend APIs

### System Endpoints

#### Health Check
```http
GET /health
```
Returns system health status and component states.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-18T10:30:00Z",
  "components": {
    "database": "connected",
    "redis": "connected",
    "api_gateway": "operational"
  }
}
```

#### System Status
```http
GET /status
```
Returns operational metrics.

**Response**:
```json
{
  "status": "operational",
  "uptime_seconds": 3600,
  "database_status": "connected",
  "cache_status": "connected"
}
```

---

### Train Management

#### Get All Trains
```http
GET /trains
```

**Response**:
```json
[
  {
    "trainId": "T001",
    "position": 24.5,
    "speed": 80.0,
    "destination": "Station_B",
    "priority": "high",
    "status": "active",
    "maxSpeed": 120.0,
    "trainLength": 200.0
  }
]
```

#### Get Train by ID
```http
GET /trains/{trainId}
```

**Parameters**:
- `trainId` (required): Train identifier (e.g., "T001")

**Response**:
```json
{
  "trainId": "T001",
  "position": 24.5,
  "speed": 80.0,
  "destination": "Station_B",
  "priority": "high",
  "status": "active"
}
```

#### Get Trains by Status
```http
GET /trains/status/{status}
```

**Parameters**:
- `status`: "active", "completed", or "delayed"

#### Get Trains by Priority
```http
GET /trains/priority/{priority}
```

**Parameters**:
- `priority`: "high", "normal", or "low"

#### Create Train
```http
POST /trains
Content-Type: application/json

{
  "trainId": "T999",
  "position": 10.0,
  "speed": 60.0,
  "destination": "Station_C",
  "priority": "normal"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "Train created successfully",
  "data": {
    "trainId": "T999",
    "position": 10.0,
    "speed": 60.0,
    ...
  }
}
```

#### Update Train
```http
PUT /trains/{trainId}
Content-Type: application/json

{
  "position": 25.0,
  "speed": 85.0,
  "status": "delayed"
}
```

#### Delete Train
```http
DELETE /trains/{trainId}
```

---

### Track Segment Management

#### Get All Segments
```http
GET /segments
```

**Response**:
```json
[
  {
    "segmentId": "S1",
    "startKm": 0.0,
    "endKm": 10.0,
    "maxCapacity": 20,
    "speedLimit": 120.0,
    "currentOccupancy": 2,
    "utilizationPercent": 10.0,
    "isBlocked": false,
    "conflictCount": 0
  }
]
```

#### Get Segment by ID
```http
GET /segments/{segmentId}
```

**Parameters**:
- `segmentId`: Segment identifier (e.g., "S1")

#### Get Blocked Segments
```http
GET /segments/blocked
```

**Response**: Array of blocked segments only

#### Create Segment
```http
POST /segments
Content-Type: application/json

{
  "segmentId": "S99",
  "startKm": 90.0,
  "endKm": 100.0,
  "maxCapacity": 25,
  "speedLimit": 120.0
}
```

#### Update Segment Occupancy
```http
PUT /segments/{segmentId}/occupancy?occupancy=5
```

**Parameters**:
- `segmentId`: Segment identifier
- `occupancy`: New occupancy count

---

## Python Backend APIs

### Simulation Endpoints

#### Get Current State
```http
GET /state
```

**Response**:
```json
{
  "timestamp": "2026-03-18T10:30:00Z",
  "simulation_state": {
    "timestamp": 125.5,
    "trains": [...],
    "segments": [...],
    "metrics": {
      "total_trains": 15,
      "total_occupancy": 12,
      "average_utilization": 65.4,
      "total_conflicts": 0
    }
  }
}
```

#### Initialize Simulation
```http
POST /simulation/init
Content-Type: application/json

{
  "track_length_km": 100.0,
  "num_segments": 10,
  "num_trains": 15,
  "disruption": "congestion"
}
```

**Parameters**:
- `track_length_km`: Total track length in km
- `num_segments`: Number of track segments
- `num_trains`: Number of trains to simulate
- `disruption`: "none", "congestion", "bottleneck", or null

**Response**:
```json
{
  "status": "success",
  "message": "Simulation initialized with 15 trains",
  "state": {...}
}
```

#### Run Simulation
```http
POST /simulation/run?steps=100
```

**Parameters**:
- `steps`: Number of simulation steps to run

**Response**:
```json
{
  "status": "success",
  "steps_completed": 100,
  "final_state": {...}
}
```

#### Single Step
```http
POST /simulation/step
```

Executes one simulation step and returns updated state.

#### Stop Simulation
```http
POST /simulation/stop
```

Stops current running simulation.

**Response**:
```json
{
  "status": "stopped",
  "state": {...}
}
```

---

### Train Operations

#### Add Train
```http
POST /train/add
Content-Type: application/json

{
  "id": "T999",
  "position": 15.0,
  "speed": 70.0,
  "destination": "Station_D",
  "priority": "high"
}
```

---

### DRL Agent Endpoints

#### Get DRL Predictions
```http
GET /drl/predict
```

Returns speed adjustment recommendations from DRL model.

**Response**:
```json
{
  "drl_actions": [0.1, -0.2, 0.15, ...],
  "safe_actions": [0.1, -0.2, 0.15, ...],
  "timestamp": "2026-03-18T10:30:00Z"
}
```

#### Train DRL Model
```http
POST /drl/train?steps=10000
```

**Parameters**:
- `steps`: Number of training steps

**Response**:
```json
{
  "status": "success",
  "message": "Model trained for 10000 steps",
  "metrics": {
    "mean_reward": 142.5,
    "std_reward": 23.4,
    "mean_episode_length": 500,
    "max_reward": 185.3,
    "min_reward": 98.2
  }
}
```

#### Resolve Conflicts
```http
POST /drl/resolve-conflicts
Content-Type: application/json

{
  "train_actions": [0.1, -0.1, 0.2],
  "train_positions": [10.5, 12.3, 15.8],
  "train_speeds": [80.0, 75.0, 90.0]
}
```

**Response**:
```json
{
  "original_actions": [0.1, -0.1, 0.2],
  "safe_actions": [0.1, -0.2, 0.2],
  "conflicts_detected": [[0, 1]]
}
```

---

### Metrics & Status

#### Get Metrics
```http
GET /metrics
```

**Response**:
```json
{
  "timestamp": "2026-03-18T10:30:00Z",
  "metrics": {
    "total_trains": 15,
    "total_occupancy": 12,
    "average_utilization": 65.4,
    "total_conflicts": 0
  }
}
```

#### Get System Status
```http
GET /status
```

**Response**:
```json
{
  "timestamp": "2026-03-18T10:30:00Z",
  "status": "operational",
  "simulation_running": true,
  "simulation_speed_multiplier": 1.0,
  "components_initialized": {
    "digital_twin": true,
    "drl_controller": true,
    "conflict_resolver": true
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid input parameters"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Train T999 not found"
}
```

### 503 Service Unavailable
```json
{
  "status": "error",
  "message": "Simulation not initialized"
}
```

---

## Rate Limits

Currently unlimited. For production, implement:
- **Simulation API**: 10 requests/second per client
- **Query API**: 100 requests/second per client
- **Training API**: 1 request/minute per client

---

## WebSocket Connections

### Real-time Simulation Updates
```
ws://localhost:8000/ws/simulation
```

Connect to receive real-time simulation state updates every 500ms.

**Message Format**:
```json
{
  "timestamp": 125.5,
  "trains": [...],
  "segments": [...],
  "metrics": {...}
}
```

---

## Code Examples

### cURL Examples

**Initialize Simulation**:
```bash
curl -X POST http://localhost:8000/api/v1/simulation/init \
  -H "Content-Type: application/json" \
  -d '{
    "track_length_km": 100,
    "num_segments": 10,
    "num_trains": 15,
    "disruption": "congestion"
  }'
```

**Get All Trains**:
```bash
curl http://localhost:8080/api/v1/trains | jq .
```

**Create Train**:
```bash
curl -X POST http://localhost:8080/api/v1/trains \
  -H "Content-Type: application/json" \
  -d '{
    "trainId": "T001",
    "position": 0,
    "speed": 60,
    "destination": "Station_B",
    "priority": "normal"
  }'
```

### Python Example

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Initialize simulation
response = requests.post(f"{BASE_URL}/simulation/init", json={
    "track_length_km": 100,
    "num_segments": 10,
    "num_trains": 15
})
print(response.json())

# Run simulation
response = requests.post(f"{BASE_URL}/simulation/run?steps=100")
print(f"Steps completed: {response.json()['steps_completed']}")

# Get predictions
response = requests.get(f"{BASE_URL}/drl/predict")
predictions = response.json()
print(f"DRL Actions: {predictions['drl_actions']}")
```

### JavaScript Example

```javascript
const BASE_URL = "http://localhost:8000/api/v1";

// Initialize simulation
async function initSimulation() {
  const response = await fetch(`${BASE_URL}/simulation/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      track_length_km: 100,
      num_segments: 10,
      num_trains: 15
    })
  });
  return await response.json();
}

// Get DRL predictions
async function getDRLPredictions() {
  const response = await fetch(`${BASE_URL}/drl/predict`);
  return await response.json();
}

// WebSocket for real-time updates
const ws = new WebSocket("ws://localhost:8000/ws/simulation");
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Current state:", data);
};
```

---

## API Documentation UIs

- **Java Swagger UI**: http://localhost:8080/swagger-ui.html (after adding springdoc-openapi)
- **Python FastAPI Docs**: http://localhost:8000/docs
- **Python ReDoc**: http://localhost:8000/redoc

---

## Versioning

Current API Version: **v1**

Future: `/api/v2` with backward compatibility maintained

---

## Changelog

### v1.0 (Current)
- Initial release
- Basic simulation control
- DRL agent integration
- Real-time monitoring

---

For additional examples and tutorials, see [QUICKSTART.md](QUICKSTART.md)
