package com.railway.dss.service;

import com.railway.dss.entity.TrackSegmentEntity;
import com.railway.dss.dto.TrackSegmentDto;
import com.railway.dss.repository.TrackSegmentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class TrackSegmentService {
    
    @Autowired
    private TrackSegmentRepository segmentRepository;
    
    public TrackSegmentDto createSegment(TrackSegmentDto segmentDto) {
        log.info("Creating track segment: {}", segmentDto.getSegmentId());
        
        TrackSegmentEntity segment = TrackSegmentEntity.builder()
                .segmentId(segmentDto.getSegmentId())
                .startKm(segmentDto.getStartKm())
                .endKm(segmentDto.getEndKm())
                .maxCapacity(segmentDto.getMaxCapacity())
                .speedLimit(segmentDto.getSpeedLimit() != null ? segmentDto.getSpeedLimit() : 120.0)
                .currentOccupancy(0)
                .isBlocked(false)
                .conflictCount(0)
                .build();
        
        TrackSegmentEntity saved = segmentRepository.save(segment);
        return convertToDto(saved);
    }
    
    public Optional<TrackSegmentDto> getSegmentById(String segmentId) {
        return segmentRepository.findBySegmentId(segmentId)
                .map(this::convertToDto);
    }
    
    public List<TrackSegmentDto> getAllSegments() {
        return segmentRepository.findAllByOrderByStartKmAsc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<TrackSegmentDto> getBlockedSegments() {
        return segmentRepository.findByIsBlockedTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public TrackSegmentDto updateOccupancy(String segmentId, Integer occupancy) {
        log.debug("Updating occupancy for segment: {} to {}", segmentId, occupancy);
        
        TrackSegmentEntity segment = segmentRepository.findBySegmentId(segmentId)
                .orElseThrow(() -> new IllegalArgumentException("Segment not found: " + segmentId));
        
        segment.setCurrentOccupancy(occupancy);
        TrackSegmentEntity updated = segmentRepository.save(segment);
        
        return convertToDto(updated);
    }
    
    private TrackSegmentDto convertToDto(TrackSegmentEntity entity) {
        Double utilization = entity.getMaxCapacity() > 0 
                ? (entity.getCurrentOccupancy().doubleValue() / entity.getMaxCapacity()) * 100 
                : 0.0;
        
        return TrackSegmentDto.builder()
                .segmentId(entity.getSegmentId())
                .startKm(entity.getStartKm())
                .endKm(entity.getEndKm())
                .maxCapacity(entity.getMaxCapacity())
                .speedLimit(entity.getSpeedLimit())
                .currentOccupancy(entity.getCurrentOccupancy())
                .utilizationPercent(utilization)
                .isBlocked(entity.getIsBlocked())
                .conflictCount(entity.getConflictCount())
                .build();
    }
}
