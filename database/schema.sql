-- Railway DSS Database Schema
-- PostgreSQL 13+

-- Create trains table
CREATE TABLE IF NOT EXISTS trains (
    id BIGSERIAL PRIMARY KEY,
    train_id VARCHAR(50) UNIQUE NOT NULL,
    position FLOAT NOT NULL DEFAULT 0,
    speed FLOAT NOT NULL DEFAULT 0,
    destination VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'normal', 'low')),
    max_speed FLOAT DEFAULT 120.0,
    train_length FLOAT DEFAULT 200.0,
    departure_time TIMESTAMP NULL,
    arrival_time TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'delayed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create track_segments table
CREATE TABLE IF NOT EXISTS track_segments (
    id BIGSERIAL PRIMARY KEY,
    segment_id VARCHAR(50) UNIQUE NOT NULL,
    start_km FLOAT NOT NULL,
    end_km FLOAT NOT NULL,
    max_capacity INTEGER NOT NULL,
    speed_limit FLOAT DEFAULT 120.0,
    current_occupancy INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    conflict_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create simulation_runs table
CREATE TABLE IF NOT EXISTS simulation_runs (
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(100) UNIQUE NOT NULL,
    scenario_name VARCHAR(255) NOT NULL,
    scenario_description TEXT,
    num_trains INTEGER,
    track_length_km FLOAT,
    disruption_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    total_steps BIGINT DEFAULT 0,
    avg_throughput FLOAT DEFAULT 0,
    avg_delay FLOAT DEFAULT 0,
    conflict_prevention_rate FLOAT DEFAULT 0,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_trains_status ON trains(status);
CREATE INDEX idx_trains_priority ON trains(priority);
CREATE INDEX idx_trains_destination ON trains(destination);
CREATE INDEX idx_segments_blocked ON track_segments(is_blocked);
CREATE INDEX idx_simulation_status ON simulation_runs(status);
CREATE INDEX idx_simulation_started ON simulation_runs(started_at);

-- Create views for common queries
CREATE VIEW active_trains AS
SELECT * FROM trains WHERE status = 'active';

CREATE VIEW blocked_segments AS
SELECT * FROM track_segments WHERE is_blocked = TRUE;

CREATE VIEW simulation_summary AS
SELECT 
    COUNT(DISTINCT run_id) as total_simulations,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_simulations,
    AVG(avg_throughput) as avg_system_throughput,
    AVG(avg_delay) as avg_system_delay
FROM simulation_runs;
