# Railway Decision Support System - Architecture Guide

## System Overview

The Railway DSS is a hybrid microservices architecture combining Python ML capabilities with Java enterprise backend and React frontend for real-time railway optimization.

```
┌─────────────────────────────────────────────────┐
│         React Web Dashboard (Port 3000)         │
│    Real-time Monitoring & Control Interface     │
└────────────────┬────────────────────────────────┘
                 │ REST / WebSocket
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────────────┐  ┌───▼─────────────────────┐
│  Java Spring Boot    │  │  Python FastAPI Backend │
│  (Port 8080)        │  │  (Port 8000)           │
│                      │  │                        │
│ - REST API Gateway   │  │ - Digital Twin         │
│ - Data Pipeline      │  │ - DRL Agent System     │
│ - DSS Engine         │  │ - Simulation Engine    │
│ - User Management    │  │ - Conflict Resolution  │
└───┬──────────────────┘  └──────────────────────┘
    │
    └────────┬───────────────────────────┐
             │                           │
    ┌────────▼──────────┐      ┌────────▼──────────┐
    │  PostgreSQL DB    │      │  Redis Cache      │
    │  (Port 5432)      │      │  (Port 6379)      │
    │  Persistent Data  │      │  Session & Queue  │
    └───────────────────┘      └───────────────────┘
```

## Component Architecture

### 1. Python Backend (ML & Simulation)

**Purpose**: AI algorithms, simulation engine, and ML model inference

**Key Modules**:
- `digital_twin/`: Railway environment simulation
- `drl_agent/`: Deep Reinforcement Learning agent using Stable-Baselines3
- `api/`: FastAPI REST endpoints

**Technology Stack**:
- FastAPI for REST API
- PyTorch for deep learning
- Stable-Baselines3 for RL algorithms
- NumPy/Pandas for data processing

**Features**:
- Real-time train position and speed simulation
- Multi-agent DRL optimization
- Conflict detection and resolution
- Safety rule enforcement
- Predictive scenario generation

### 2. Java Backend (DSS & API Gateway)

**Purpose**: Enterprise-grade API gateway, data persistence, and DSS logic

**Key Components**:
- `controller/`: REST API endpoints
- `service/`: Business logic
- `entity/`: JPA data models
- `repository/`: Database access

**Technology Stack**:
- Spring Boot 3.x
- Spring Data JPA for ORM
- PostgreSQL for persistence
- Redis for caching
- Spring WebSocket for real-time updates

**Responsibilities**:
- API gateway & routing
- Request validation & authentication
- Data persistence & transactions
- Real-time data aggregation
- System monitoring & health checks

### 3. React Frontend (Dashboard UI)

**Purpose**: Interactive web interface for section controllers

**Key Sections**:
- Dashboard: Real-time monitoring & KPIs
- Simulation Panel: Scenario configuration & execution
- Analytics: Historical data & performance reports

**Technology Stack**:
- React 18 with hooks
- React Router for navigation
- Chart.js for visualizations
- Axios for API calls
- Tailwind CSS for styling

**Features**:
- Real-time train visualization
- Track segment status monitoring
- Simulation control interface
- Performance metrics dashboard
- Conflict alerts & notifications

### 4. Databases

#### PostgreSQL
**Purpose**: Persistent data storage

**Key Tables**:
- `trains`: Train records with position, speed, destination
- `track_segments`: Track topology and occupancy
- `simulation_runs`: Simulation history and results

**Features**:
- ACID transactions
- Complex queries for analytics
- Time-series data support
- Views for common queries

#### Redis
**Purpose**: High-speed caching & real-time message queue

**Uses**:
- Session caching
- Real-time train position cache
- Pub/Sub for live updates
- Rate limiting

## Data Flow

### Simulation Flow
```
1. User initializes scenario (React Dashboard)
   ↓
2. Java backend receives request → validates config
   ↓
3. Python backend creates Digital Twin with config parameters
   ↓
4. For each simulation step:
   a. Digital Twin updates train positions
   b. DRL Agent generates control actions
   c. Conflict Resolver applies safety rules
   d. Updated state sent to Java backend
   e. Java backend caches in Redis
   f. Frontend polls/subscribes to updates
   ↓
5. Simulation results stored in PostgreSQL
   ↓
6. Analytics computed and displayed in Dashboard
```

### Real-Time Data Flow
```
Simulation Engine (Python)
    ↓ (every 500ms)
Redis Pub/Sub (current state)
    ↓
Java Backend (aggregates & validates)
    ↓ (WebSocket)
React Frontend (live dashboard update)
```

## API Layers

### REST API (Java Backend)
- `/api/v1/trains` - Train management
- `/api/v1/segments` - Track management
- `/api/v1/simulation` - Simulation control
- `/api/v1/health` - System health

### FastAPI Endpoints (Python Backend)
- `/api/v1/state` - Current simulation state
- `/api/v1/simulation/*` - Simulation operations
- `/api/v1/drl/*` - DRL predictions
- `/ws/simulation` - WebSocket real-time stream

## Deployment Architecture

### Local Development
- Each service runs independently
- Direct localhost connections
- Single machine deployment

### Docker Deployment
- Containerized services
- Docker Compose orchestration
- Network isolation via docker bridge
- Volume mounts for persistence

### Production Architecture (Scalable)
- Kubernetes orchestration
- Horizontal pod autoscaling
- Service mesh (Istio)
- Load balancing
- Distributed database replicas

## Technology Decisions

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Python ML | PyTorch + SB3 | Industry-standard RL libraries |
| Java API | Spring Boot | Enterprise reliability & scalability |
| Frontend | React | Rich interactive UI, React Router |
| Database | PostgreSQL | Complex queries, transactions, reliability |
| Cache | Redis | Ultra-fast access, Pub/Sub capabilities |
| Container | Docker | Reproducible environments |

## Performance Characteristics

- **Simulation Speed**: 100-1000 steps/second (depending on train count)
- **API Response Time**: <100ms (average)
- **Real-time Update Latency**: <500ms
- **Database Query Time**: <50ms (with indexes)
- **Cache Hit Ratio**: >95% for train positions

## Scalability Considerations

1. **Horizontal Scaling**:
   - Multiple Java backend instances
   - Load balancer for routing
   - Shared PostgreSQL (read replicas)
   - Shared Redis cluster

2. **Vertical Scaling**:
   - Optimize DRL model (prune, quantize)
   - Database indexing improvements
   - Redis memory optimization
   - Cache hit ratio improvements

3. **Bottlenecks**:
   - Database write lock (mitigated by batching)
   - Simulation step time (parallelizable across segments)
   - WebSocket connections (server limits)

## Security Architecture

1. **Authentication**: API key validation (future: JWT)
2. **Authorization**: Role-based access control
3. **Data Validation**: Input sanitization at API boundaries
4. **HTTPS**: TLS encryption for production
5. **Database**: Parameterized queries (SQL injection prevention)
6. **Rate Limiting**: Redis-based request throttling

## Monitoring & Observability

### Metrics
- Request rate & latency
- Simulation performance metrics
- System resource usage
- Cache hit/miss ratios
- Database query performance

### Logging
- Structured logging (JSON format)
- Centralized log aggregation (ELK stack for production)
- Debug, info, warning, error levels

### Health Checks
- `/health` endpoint for each service
- Database connectivity test
- Redis connectivity test
- Simulation engine status

## Future Enhancements

1. **Real-time Integration**: Connect to actual railway sensor data
2. **Advanced Analytics**: Machine learning for KPI prediction
3. **Mobile App**: Native iOS/Android clients
4. **Advanced Visualization**: 3D track rendering with D3.js
5. **Multi-region Support**: Distributed simulation across regions
6. **Blockchain Integration**: Immutable audit log for critical decisions
