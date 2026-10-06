package com.railway.dss.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_runs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class SimulationRunEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String runId;
    
    @Column(nullable = false)
    private String scenarioName;
    
    @Column(length = 1000)
    private String scenarioDescription;
    
    @Column(name = "num_trains")
    private Integer numTrains;
    
    @Column(name = "track_length_km")
    private Double trackLengthKm;
    
    @Column(name = "disruption_type")
    private String disruptionType;
    
    @Column(name = "status")
    private String status = "running"; // running, completed, failed
    
    @Column(name = "total_steps")
    private Long totalSteps = 0L;
    
    @Column(name = "avg_throughput")
    private Double avgThroughput = 0.0;
    
    @Column(name = "avg_delay")
    private Double avgDelay = 0.0;
    
    @Column(name = "conflict_Prevention_rate")
    private Double conflictPreventionRate = 0.0;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        startedAt = LocalDateTime.now();
    }
}
