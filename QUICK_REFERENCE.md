# Railway DSS - Quick Reference Card

## 🚀 Start Here

```bash
# Navigate to project
cd c:\Major\ Project\railway-dss

# Option 1: Start everything with Docker (recommended)
docker-compose up -d

# Option 2: Start individual services
# Terminal 1 - Python
cd backend-python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python src/api/main.py

# Terminal 2 - Java
cd backend-java
mvn spring-boot:run

# Terminal 3 - React
cd frontend-react
npm install
npm start
```

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Dashboard | http://localhost:3000 | UI |
| Java API | http://localhost:8080/api/v1 | Rest API |
| Python API | http://localhost:8000/api/v1 | ML/Simulation |
| Python Docs | http://localhost:8000/docs | API Docs |
| Database | localhost:5432 | PostgreSQL |
| Cache | localhost:6379 | Redis |

## 📁 Key Files to Edit

### Python Simulation
`backend-python/src/digital_twin/simulator.py`
- Train physics model
- Track management
- Conflict detection

### Python ML
`backend-python/src/drl_agent/controller.py`
- RL agent training
- Model inference
- Safety rules

### Java API
`backend-java/src/main/java/com/railway/dss/` 
- Controllers (REST endpoints)
- Services (business logic)
- Entities (data models)

### React Dashboard
`frontend-react/src/pages/Dashboard.js`
- Main monitoring view
- Real-time updates
- Metrics display

### Database Schema
`database/schema.sql`
- Table definitions
- Indexes
- Views

## 🔧 Common Commands

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Single service logs
docker-compose logs -f java_backend
```

### Python
```bash
# Activate venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux

# Run simulation test
python src/digital_twin/simulator.py

# Run DRL controller
python src/drl_agent/controller.py

# Run tests
pytest src/tests/

# Format code
black src/
```

### Java
```bash
# Start with Maven
mvn spring-boot:run

# Run tests
mvn test

# Build JAR
mvn clean package

# Debug mode
mvn -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005" spring-boot:run
```

### React
```bash
# Start dev server
npm start

# Build production
npm run build

# Run tests
npm test

# Format code
npx prettier --write src/
```

### Database
```bash
# Connect to PostgreSQL
psql -U postgres -h localhost -d railway_dss

# Load schema
psql -U postgres -h localhost -d railway_dss -f database/schema.sql

# View tables
\dt

# Query example
SELECT * FROM trains LIMIT 5;
```

## 🔗 API Examples

### Simulate
```bash
# Initialize
curl -X POST http://localhost:8000/api/v1/simulation/init \
  -H "Content-Type: application/json" \
  -d '{"num_trains": 10, "num_segments": 5}'

# Run 100 steps
curl -X POST "http://localhost:8000/api/v1/simulation/run?steps=100"

# Get state
curl http://localhost:8000/api/v1/state
```

### Trains
```bash
# Get all trains
curl http://localhost:8080/api/v1/trains

# Create train
curl -X POST http://localhost:8080/api/v1/trains \
  -H "Content-Type: application/json" \
  -d '{"trainId":"T1","position":0,"speed":60,"destination":"A"}'

# Get one train
curl http://localhost:8080/api/v1/trains/T001
```

### Tracks
```bash
# Get all segments
curl http://localhost:8080/api/v1/segments

# Update occupancy
curl -X PUT "http://localhost:8080/api/v1/segments/S1/occupancy?occupancy=5"
```

### ML
```bash
# Get predictions
curl http://localhost:8000/api/v1/drl/predict

# Train model (long-running)
curl -X POST "http://localhost:8000/api/v1/drl/train?steps=10000"
```

## 📊 File Organization Cheat Sheet

```
railway-dss/
├── backend-python/        # Python files here
│   └── src/
│       ├── digital_twin/  # Edit for simulation
│       ├── drl_agent/     # Edit for ML
│       └── api/           # Edit for endpoints
├── backend-java/          # Java files here
│   └── src/main/java/
│       └── com/railway/dss/
│           ├── entity/    # Database models
│           ├── service/   # Business logic
│           ├── controller/ # REST endpoints
│           └── dto/       # Data models
├── frontend-react/        # React files here
│   └── src/
│       ├── components/    # UI components
│       ├── pages/         # Views
│       └── services/      # API calls
└── database/              # Edit schema.sql
```

## 🐛 Debugging Checklist

**Services won't start?**
- Check if ports are in use: `netstat -ano`
- Check Docker Desktop is running
- Review error logs: `docker-compose logs`

**API returning 500?**
- Check Java backend logs
- Check database connection: `psql -U postgres -h localhost`
- Check Redis: `redis-cli ping`

**Dashboard blank?**
- Open DevTools (F12)
- Check console for errors
- Check Network tab for failed requests
- Try refreshing page

**Database error?**
- Verify PostgreSQL running
- Check credentials in `application.properties`
- Run schema: `psql -f database/schema.sql`
- Check tables exist: `\dt` in psql

**API endpoint not found?**
- Check URL is correct
- Restart Java backend
- Check @RequestMapping annotations
- Verify port (8080 for Java, 8000 for Python)

## 📈 Performance Tips

### Make it Faster
```bash
# Measure simulation speed
python -m timeit -n 1 -r 1 "if True: exec(open('profile.py').read())"

# Profile Python code
python -m cProfile -s cumtime src/api/main.py

# Profile Java (Async sampling)
# Activity Monitor / Task Manager to watch resources
```

### Database Optimization
```sql
-- In PostgreSQL
ANALYZE trains;
ANALYZE track_segments;
EXPLAIN SELECT * FROM trains WHERE position > 50;
```

### React Performance
- Use React DevTools Profiler
- Check Network tab for large transfers
- Build: `npm run build` (production optimized)

## 📝 Documentation Map

| Question | File |
|----------|------|
| "Where do I start?" | [README.md](README.md) |
| "How does it work?" | [ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| "How do I set it up?" | [QUICKSTART.md](docs/QUICKSTART.md) |
| "What APIs exist?" | [API.md](docs/API.md) |
| "How does ML work?" | [DRL_DESIGN.md](docs/DRL_DESIGN.md) |
| "What's the plan?" | [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) |

## 🎯 Weekly Tasks Template

### Monday: Planning
- [ ] Review phase objectives
- [ ] Break into daily tasks
- [ ] Set success criteria

### Wednesday: Progress Check
- [ ] Test current implementation
- [ ] Identify blockers
- [ ] Adjust plan if needed

### Friday: Review
- [ ] Test all features
- [ ] Update docs
- [ ] Commit code: `git commit -am "Week X: completed"`

## 🚨 Emergency Commands

```bash
# Kill Docker containers (if stuck)
docker kill $(docker ps -q)

# Clean everything (WARNING: deletes data)
docker-compose down -v

# Free up port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Reset database
psql -U postgres
DROP DATABASE railway_dss;
CREATE DATABASE railway_dss;
\i database/schema.sql
```

## 💾 Version Control Basics

```bash
# Initialize if first time
git init

# See changes
git status

# Add changes
git add .

# Commit
git commit -m "Describe what you did"

# Push
git push origin main

# Create branch for feature
git checkout -b feature/myfeature
git commit -m "Work on feature"
git push origin feature/myfeature
```

## 🧪 Testing Snippets

### Python Test
```python
from digital_twin.simulator import DigitalTwin
twin = DigitalTwin(100, 10)
twin.create_scenario(15)
for _ in range(100):
    twin.step()
assert len(twin.trains) == 15
print("✓ Test passed")
```

### API Test
```bash
# Test Java API
curl -f http://localhost:8080/api/v1/health || echo "Failed"

# Test Python API
curl -f http://localhost:8000/api/v1/state || echo "Failed"

# Test Database
psql -U postgres -h localhost -c "\dt" || echo "Failed"
```

### React Test
```bash
npm test -- --watch=false --coverage
```

## 🎓 Learning Path

1. **Day 1**: Understand architecture
2. **Days 2-3**: Explore APIs  
3. **Days 4-5**: Read source code
4. **Days 6-7**: Make small changes
5. **Week 2+**: Build features

## 📊 Key Shortcuts

| Action | Command |
|--------|---------|
| View logs | `docker-compose logs -f` |
| Restart service | `docker-compose restart java_backend` |
| Connect to DB | `psql -U postgres -h localhost` |
| API Docs | http://localhost:8000/docs |
| Build React | `npm run build` |
| Format code | `black src/` (Python) |
| Test Python | `pytest src/tests/` |

## 🎁 Bonus: One-Liners

```bash
# See what's running on ports
netstat -ano | grep LISTEN

# Quick simulation test (Python backend must run first)
curl -X POST http://localhost:8000/api/v1/simulation/init -H "Content-Type: application/json" -d '{"num_trains":10}' | json_pp

# Watch logs in real-time
tail -f logs/application.log

# Count lines of code
find . -name "*.py" -o -name "*.java" -o -name "*.js" | xargs wc -l

# Git log visualization
git log --oneline --graph --decorate --all
```

---

## 🔗 Quick Links

- **Docker Compose Docs**: https://docs.docker.com/compose/
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Spring Boot Guide**: https://spring.io/guides/
- **React Docs**: https://react.dev
- **PostgreSQL Guide**: https://www.postgresql.org/docs/

---

**Print this card or bookmark it! 📌**

Last Updated: March 18, 2026
