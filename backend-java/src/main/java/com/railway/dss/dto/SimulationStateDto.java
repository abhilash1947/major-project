package com.railway.dss.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationStateDto {
    private String timestamp;
    private Integer totalTrains;
    private Integer totalOccupancy;
    private Double averageUtilization;
    private Integer totalConflicts;
    private Double throughput;
    private Double averageDelay;
}
