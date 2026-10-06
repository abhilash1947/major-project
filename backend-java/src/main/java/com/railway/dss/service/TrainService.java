package com.railway.dss.service;

import com.railway.dss.entity.TrainEntity;
import com.railway.dss.dto.TrainDto;
import com.railway.dss.repository.TrainRepository;
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
public class TrainService {
    
    @Autowired
    private TrainRepository trainRepository;
    
    public TrainDto createTrain(TrainDto trainDto) {
        log.info("Creating train: {}", trainDto.getTrainId());
        
        TrainEntity train = TrainEntity.builder()
                .trainId(trainDto.getTrainId())
                .position(trainDto.getPosition())
                .speed(trainDto.getSpeed())
                .destination(trainDto.getDestination())
                .priority(trainDto.getPriority())
                .status("active")
                .maxSpeed(trainDto.getMaxSpeed() != null ? trainDto.getMaxSpeed() : 120.0)
                .trainLength(trainDto.getTrainLength() != null ? trainDto.getTrainLength() : 200.0)
                .build();
        
        TrainEntity saved = trainRepository.save(train);
        log.info("Train created successfully: {}", saved.getTrainId());
        
        return convertToDto(saved);
    }
    
    public Optional<TrainDto> getTrainById(String trainId) {
        return trainRepository.findByTrainId(trainId)
                .map(this::convertToDto);
    }
    
    public List<TrainDto> getAllTrains() {
        return trainRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<TrainDto> getTrainsByStatus(String status) {
        return trainRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<TrainDto> getTrainsByPriority(String priority) {
        return trainRepository.findByPriority(priority).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public TrainDto updateTrain(String trainId, TrainDto trainDto) {
        log.info("Updating train: {}", trainId);
        
        TrainEntity train = trainRepository.findByTrainId(trainId)
                .orElseThrow(() -> new IllegalArgumentException("Train not found: " + trainId));
        
        train.setPosition(trainDto.getPosition());
        train.setSpeed(trainDto.getSpeed());
        train.setDestination(trainDto.getDestination());
        train.setPriority(trainDto.getPriority());
        train.setStatus(trainDto.getStatus());
        
        TrainEntity updated = trainRepository.save(train);
        return convertToDto(updated);
    }
    
    public void deleteTrain(String trainId) {
        log.info("Deleting train: {}", trainId);
        TrainEntity train = trainRepository.findByTrainId(trainId)
                .orElseThrow(() -> new IllegalArgumentException("Train not found: " + trainId));
        trainRepository.delete(train);
    }
    
    private TrainDto convertToDto(TrainEntity entity) {
        return TrainDto.builder()
                .trainId(entity.getTrainId())
                .position(entity.getPosition())
                .speed(entity.getSpeed())
                .destination(entity.getDestination())
                .priority(entity.getPriority())
                .status(entity.getStatus())
                .maxSpeed(entity.getMaxSpeed())
                .trainLength(entity.getTrainLength())
                .build();
    }
}
