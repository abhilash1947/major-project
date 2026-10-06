package com.railway.dss.controller;

import com.railway.dss.dto.TrackSegmentDto;
import com.railway.dss.service.TrackSegmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/segments")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class TrackSegmentController {
    
    @Autowired
    private TrackSegmentService segmentService;
    
    @GetMapping
    public ResponseEntity<List<TrackSegmentDto>> getAllSegments() {
        log.info("Fetching all track segments");
        List<TrackSegmentDto> segments = segmentService.getAllSegments();
        return ResponseEntity.ok(segments);
    }
    
    @GetMapping("/{segmentId}")
    public ResponseEntity<TrackSegmentDto> getSegmentById(@PathVariable String segmentId) {
        log.info("Fetching segment: {}", segmentId);
        Optional<TrackSegmentDto> segment = segmentService.getSegmentById(segmentId);
        
        if (segment.isPresent()) {
            return ResponseEntity.ok(segment.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/blocked")
    public ResponseEntity<List<TrackSegmentDto>> getBlockedSegments() {
        log.info("Fetching blocked segments");
        List<TrackSegmentDto> segments = segmentService.getBlockedSegments();
        return ResponseEntity.ok(segments);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSegment(@RequestBody TrackSegmentDto segmentDto) {
        log.info("Creating new track segment: {}", segmentDto.getSegmentId());
        
        try {
            TrackSegmentDto created = segmentService.createSegment(segmentDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Segment created successfully");
            response.put("data", created);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating segment", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @PutMapping("/{segmentId}/occupancy")
    public ResponseEntity<Map<String, Object>> updateOccupancy(
            @PathVariable String segmentId,
            @RequestParam Integer occupancy) {
        log.info("Updating occupancy for segment: {} to {}", segmentId, occupancy);
        
        try {
            TrackSegmentDto updated = segmentService.updateOccupancy(segmentId, occupancy);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Occupancy updated successfully");
            response.put("data", updated);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Segment not found: {}", segmentId);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Segment not found");
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
}
