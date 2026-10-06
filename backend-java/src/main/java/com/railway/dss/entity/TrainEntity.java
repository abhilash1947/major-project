package com.railway.dss.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class TrainEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String trainId;
    
    @Column(nullable = false)
    private Double position; // km
    
    @Column(nullable = false)
    private Double speed; // km/h
    
    @Column(nullable = false)
    private String destination;
    
    @Column(nullable = false)
    private String priority; // high, normal, low
    
    @Column(name = "max_speed")
    private Double maxSpeed = 120.0;
    
    @Column(name = "train_length")
    private Double trainLength = 200.0; // meters
    
    @Column(name = "departure_time")
    private LocalDateTime departureTime;
    
    @Column(name = "arrival_time")
    private LocalDateTime arrivalTime;
    
    @Column(name = "status")
    private String status = "active"; // active, completed, delayed
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
