package com.railway.dss.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "track_segments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class TrackSegmentEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String segmentId;
    
    @Column(name = "start_km")
    private Double startKm;
    
    @Column(name = "end_km")
    private Double endKm;
    
    @Column(name = "max_capacity")
    private Integer maxCapacity; // trains per hour
    
    @Column(name = "speed_limit")
    private Double speedLimit = 120.0;
    
    @Column(name = "current_occupancy")
    private Integer currentOccupancy = 0;
    
    @Column(name = "is_blocked")
    private Boolean isBlocked = false;
    
    @Column(name = "conflict_count")
    private Integer conflictCount = 0;
    
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
