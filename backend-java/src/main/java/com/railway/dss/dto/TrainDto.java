package com.railway.dss.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainDto {
    private String trainId;
    private Double position;
    private Double speed;
    private String destination;
    private String priority;
    private String status;
    private Double maxSpeed;
    private Double trainLength;
}
