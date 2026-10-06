package com.railway.dss.repository;

import com.railway.dss.entity.TrainEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface TrainRepository extends JpaRepository<TrainEntity, Long> {
    Optional<TrainEntity> findByTrainId(String trainId);
    List<TrainEntity> findByStatus(String status);
    List<TrainEntity> findByPriority(String priority);
    List<TrainEntity> findByDestination(String destination);
}
