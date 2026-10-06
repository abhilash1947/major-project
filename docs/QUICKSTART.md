# Railway DSS - Getting Started Guide

## Quick Start (5 minutes)

### Prerequisites
- Docker & Docker Compose installed
- OR Java 11+, Python 3.9+, Node 16+ (for local development)

### Option 1: Docker (Recommended)

```bash
# Navigate to project root
cd railway-dss

# Start all services
docker-compose up -d

# Wait for services to start (~30 seconds)
docker-compose logs -f

# Access the dashboard
# Browser: http://localhost:3000
```

### Option 2: Local Development

#### 1. Start PostgreSQL
```bash
# Using Docker for just the database
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:13

# Create database
psql -U postgres -h localhost -c "CREATE DATABASE railway_dss;"
```

#### 2. Start Redis
```bash
docker run -d -p 6379:6379 redis:7
```

#### 3. Start Python Backend
```bash
cd backend-python
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python src/api/main.py
# Access: http://localhost:8000/docs
```

#### 4. Start Java Backend
```bash
cd backend-java
./mvnw spring-boot:run  # Linux/Mac
mvnw.cmd spring-boot:run  # Windows
# Access: http://localhost:8080
```

#### 5. Start React Frontend
```bash
cd frontend-react
npm install
npm start
# Browser opens at http://localhost:3000
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8080/api/v1/health
```

### Get All Trains
```bash
curl http://localhost:8080/api/v1/trains
```

### Get Track Segments
```bash
curl http://localhost:8080/api/v1/segments
```

### Initialize Simulation (Python)
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

### Run Simulation for N steps
```bash
curl -X POST "http://localhost:8000/api/v1/simulation/run?steps=100"
```

### Get DRL Predictions
```bash
curl http://localhost:8000/api/v1/drl/predict
```

## Docker Commands

### View logs
```bash
docker-compose logs -f java_backend
docker-compose logs -f python_backend
docker-compose logs -f react_frontend
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes
```bash
docker-compose down -v
```

### Rebuild images
```bash
docker-compose build --no-cache
```

## Development Tips

### Python Backend Development
```bash
# Install development dependencies
pip install pytest pytest-cov

# Run tests
pytest src/tests/

# Code formatting
pip install black
black src/

# Linting
pip install pylint
pylint src/
```

### Java Backend Development
```bash
# Run with debug mode
./mvnw -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005" spring-boot:run

# Run tests
./mvnw test

# Code formatting
./mvnw fmt:format

# Generate API documentation
./mvnw springdoc-openapi-maven-plugin:properties
```

### React Frontend Development
```bash
# Install dependencies
npm install

# Development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test

# Code formatting
npx prettier --write src/
```

## Database Setup

### Manual PostgreSQL Setup
```sql
-- Connect to PostgreSQL
psql -U postgres -h localhost

-- Create database
CREATE DATABASE railway_dss;

-- Load schema
psql -U postgres -d railway_dss -f database/schema.sql
```

### Verify Database
```sql
-- List tables
\dt

-- Check trains table
SELECT COUNT(*) FROM trains;

-- Check track segments
SELECT * FROM track_segments;
```

## Troubleshooting

### Port Already in Use
```bash
# Linux/Mac
lsof -i :8080  # Find process using port 8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker exec railway_postgres pg_isready

# Check credentials in application.properties
# Default: postgres/postgres
```

### Python Module Import Error
```bash
# Ensure you're in virtual environment
source venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### React Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

## Project Structure Overview

```
railway-dss/
├── backend-python/           # Python ML & Simulation
│   ├── src/
│   │   ├── digital_twin/    # Simulator
│   │   ├── drl_agent/       # RL Agent
│   │   └── api/             # FastAPI
│   └── requirements.txt
│
├── backend-java/             # Java DSS & API
│   ├── src/main/
│   │   ├── java/
│   │   └── resources/       # Config files
│   └── pom.xml
│
├── frontend-react/           # React Dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/        # API calls
│   ├── package.json
│   └── public/
│
├── database/                 # SQL schema
├── .docker/                  # Dockerfile configs
├── docker-compose.yml        # Full stack
└── docs/                     # Documentation
```

## Next Steps

1. **Explore Dashboard**: http://localhost:3000
2. **Try Simulation**: Click "Simulation" → configure → run
3. **View Analytics**: Check performance metrics
4. **Read Documentation**: Check `/docs` folder
5. **Modify Configuration**: Edit `application.properties` and `.env`

## Performance Tuning

### Database Optimization
```sql
-- Analyze tables for query planning
ANALYZE trains;
ANALYZE track_segments;

-- Monitor slow queries
SET log_min_duration_statement = 1000; -- log queries > 1s
```

### Redis Optimization
```bash
# Monitor Redis performance
redis-cli INFO stats
redis-cli SLOWLOG GET 10
```

### Application Tuning
- Increase JVM heap: `-Xmx2g` in JAVA_OPTS
- Tune thread pool: `server.tomcat.threads.max=200`
- Adjust connection pool: `spring.datasource.hikari.maximum-pool-size=20`

## Production Deployment

For production setup, see [DEPLOYMENT.md](DEPLOYMENT.md)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Services won't start | Check ports in use, ensure Docker running |
| Database connection refused | Verify PostgreSQL container health |
| API returning 503 | Check Python backend logs |
| Dashboard blank | Clear browser cache, check console errors |
| High memory usage | Reduce simulation train count |

## Getting Help

- Check service logs: `docker-compose logs <service>`
- Review error in browser DevTools (F12)
- Check API documentation: `/docs` endpoints
- See troubleshooting section above

---

**Happy building! 🚂**
