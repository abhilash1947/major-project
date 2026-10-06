package com.railway.dss.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackSegmentDto {
    private String segmentId;
    private Double startKm;
    private Double endKm;
    private Integer maxCapacity;
    private Double speedLimit;
    private Integer currentOccupancy;
    private Double utilizationPercent;
    private Boolean isBlocked;
    private Integer conflictCount;
}
