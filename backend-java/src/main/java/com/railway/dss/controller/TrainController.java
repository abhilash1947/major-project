package com.railway.dss.controller;

import com.railway.dss.dto.TrainDto;
import com.railway.dss.service.TrainService;
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
@RequestMapping("/api/v1/trains")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class TrainController {
    
    @Autowired
    private TrainService trainService;
    
    @GetMapping
    public ResponseEntity<List<TrainDto>> getAllTrains() {
        log.info("Fetching all trains");
        List<TrainDto> trains = trainService.getAllTrains();
        return ResponseEntity.ok(trains);
    }
    
    @GetMapping("/{trainId}")
    public ResponseEntity<TrainDto> getTrainById(@PathVariable String trainId) {
        log.info("Fetching train: {}", trainId);
        Optional<TrainDto> train = trainService.getTrainById(trainId);
        
        if (train.isPresent()) {
            return ResponseEntity.ok(train.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TrainDto>> getTrainsByStatus(@PathVariable String status) {
        log.info("Fetching trains with status: {}", status);
        List<TrainDto> trains = trainService.getTrainsByStatus(status);
        return ResponseEntity.ok(trains);
    }
    
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TrainDto>> getTrainsByPriority(@PathVariable String priority) {
        log.info("Fetching trains with priority: {}", priority);
        List<TrainDto> trains = trainService.getTrainsByPriority(priority);
        return ResponseEntity.ok(trains);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTrain(@RequestBody TrainDto trainDto) {
        log.info("Creating new train: {}", trainDto.getTrainId());
        
        try {
            TrainDto created = trainService.createTrain(trainDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Train created successfully");
            response.put("data", created);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating train", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @PutMapping("/{trainId}")
    public ResponseEntity<Map<String, Object>> updateTrain(
            @PathVariable String trainId,
            @RequestBody TrainDto trainDto) {
        log.info("Updating train: {}", trainId);
        
        try {
            TrainDto updated = trainService.updateTrain(trainId, trainDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Train updated successfully");
            response.put("data", updated);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Train not found: {}", trainId);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Train not found");
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
    
    @DeleteMapping("/{trainId}")
    public ResponseEntity<Map<String, Object>> deleteTrain(@PathVariable String trainId) {
        log.info("Deleting train: {}", trainId);
        
        try {
            trainService.deleteTrain(trainId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Train deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Train not found: {}", trainId);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Train not found");
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }
}
