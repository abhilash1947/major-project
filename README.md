# Railway Digital Twin & Decision Support System (DSS)

A high-performance, AI-powered railway management system using Deep Reinforcement Learning and Multi-Agent systems to optimize section throughput and reduce delays.

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 React Dashboard (Port 3000)             │
│           Real-time Monitoring & Control UI             │
└────────────┬────────────────────────────────────────────┘
             │ REST API / WebSocket
    ┌────────┴────────┐
    │                 │
┌───▼──────────────────────────┐  ┌──────────────────────┐
│  Java Spring Boot Backend     │  │  Python ML Service   │
│  (Port 8080)                  │  │  (Port 8000)         │
│  - REST/gRPC APIs             │  │  - Digital Twin      │
│  - Real-time data pipeline    │  │  - DRL Agent         │
│  - DSS Engine                 │  │  - Simulation Engine │
│  - User management            │  │  - Conflict Solver   │
└───┬──────────────────────────┘  └──────────────────────┘
    │
    └────────┬───────────────────────────┐
             │                           │
    ┌────────▼──────────┐      ┌────────▼──────────┐
    │  PostgreSQL       │      │  Redis Cache      │
    │  (Port 5432)      │      │  (Port 6379)      │
    │  Real-time Data   │      │  Fast Queries     │
    └───────────────────┘      └───────────────────┘
```

## 📦 Components

### 1. **Python Backend** (`backend-python/`)
- **Digital Twin**: Simulates railway environment with real-time traffic
- **DRL Agent**: Multi-agent system using Stable-Baselines3 & PyTorch
- **Simulation Engine**: Generates synthetic railway scenarios
- **FastAPI**: Lightweight REST endpoints

### 2. **Java Backend** (`backend-java/`)
- **Spring Boot**: Enterprise-grade REST API
- **Data Pipeline**: Real-time data ingestion & processing
- **DSS Engine**: Decision logic & optimization rules
- **gRPC**: High-performance communication with Python service

### 3. **React Frontend** (`frontend-react/`)
- **Dashboard**: Real-time train visualization
- **Monitoring**: KPIs, alerts, performance metrics
- **Control Panel**: Manual scheduling, what-if analysis
- **Charts**: Historical data & analytics

### 4. **Database**
- **PostgreSQL**: Persistent data (trains, schedules, results)
- **Redis**: Caching & real-time data streams

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Java 11+
- Node.js 16+
- Docker & Docker Compose
- PostgreSQL 13+
- Redis 6+

### Setup (Local Development)

#### 1. Python Backend
```bash
cd backend-python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

#### 2. Java Backend
```bash
cd backend-java
./mvnw clean install
./mvnw spring-boot:run
```

#### 3. React Frontend
```bash
cd frontend-react
npm install
npm start
```

### Docker Setup (Recommended)
```bash
docker-compose up -d
```

Access:
- Dashboard: http://localhost:3000
- Java API: http://localhost:8080
- Python API: http://localhost:8000

---

## 📊 System Features

### Core Capabilities
✅ Real-time train tracking & simulation
✅ Deep Reinforcement Learning optimization
✅ Multi-Agent coordination system
✅ Predictive conflict detection
✅ Automated re-scheduling
✅ Safety rule enforcement (Indian Railway standards)
✅ Interactive DSS dashboard
✅ What-if scenario analysis
✅ Performance analytics & reporting

### Key Metrics
- **Section Throughput**: Trains handled per hour
- **Average Delay**: In seconds
- **Headway Reduction**: Safety buffer compression %
- **Conflict Avoidance Rate**: Percentage prevented
- **System Efficiency**: Capacity utilization %

---

## 📁 Project Structure

```
railway-dss/
├── backend-python/           # Python ML & Simulation Engine
│   ├── src/
│   │   ├── digital_twin/     # Railway environment simulation
│   │   ├── drl_agent/        # Reinforcement learning agents
│   │   ├── api/              # FastAPI endpoints
│   │   └── utils/            # Helper functions
│   ├── requirements.txt
│   └── main.py
├── backend-java/             # Java DSS & API Gateway
│   ├── src/main/java/
│   │   └── com/railway/dss/  # Java packages
│   ├── src/main/resources/   # Configurations
│   ├── pom.xml
│   └── mvnw
├── frontend-react/           # React Dashboard
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── api/              # API service calls
│   │   └── App.js
│   ├── package.json
│   └── public/
├── database/                 # DB schemas & migrations
│   ├── schema.sql
│   └── seed.sql
├── .docker/                  # Docker configurations
│   ├── Dockerfile.python
│   ├── Dockerfile.java
│   └── docker-compose.yml
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DRL_DESIGN.md
└── README.md
```

---

## 🔑 Key Technologies

| Component | Technology |
|-----------|-----------|
| **Backend (ML)** | Python 3.9, FastAPI, PyTorch, Stable-Baselines3 |
| **Backend (API)** | Java 11, Spring Boot, gRPC |
| **Frontend** | React 18, Redux, Chart.js, WebSocket |
| **Database** | PostgreSQL 13, Redis 6 |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## 📚 Learning Objectives

This project teaches:
- ✅ Full-stack web application development
- ✅ Deep Reinforcement Learning algorithms
- ✅ Multi-Agent system design
- ✅ Real-time data streaming
- ✅ Microservices architecture
- ✅ Database optimization & caching
- ✅ REST API & gRPC design
- ✅ Real-time visualization

---

## 📖 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design & components
- [API Documentation](docs/API.md) - Endpoints & data models
- [DRL Design](docs/DRL_DESIGN.md) - Reinforcement learning approach
- [Database Schema](database/schema.sql) - Data model
- [Deployment Guide](docs/DEPLOYMENT.md) - Production setup

---

## 🧪 Testing

```bash
# Python tests
cd backend-python
pytest src/tests/

# Java tests
cd backend-java
./mvnw test

# Frontend tests
cd frontend-react
npm test
```

---

## 🎯 Development Phases

**Phase 1 (Week 1-2)**: Foundation & Architecture ✓
**Phase 2 (Week 3-4)**: Digital Twin Simulator
**Phase 3 (Week 5-6)**: DRL Agent System
**Phase 4 (Week 7-8)**: Web Dashboard & DSS

---

## 🤝 Contributing

This is a major project. Follow the guidelines in each component's README.

---

## 📝 License

Educational Project - 2026

---

**Happy Building! 🚀**
