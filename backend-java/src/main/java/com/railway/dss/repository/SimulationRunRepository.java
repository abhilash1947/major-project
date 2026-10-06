package com.railway.dss.repository;

import com.railway.dss.entity.SimulationRunEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SimulationRunRepository extends JpaRepository<SimulationRunEntity, Long> {
    Optional<SimulationRunEntity> findByRunId(String runId);
    List<SimulationRunEntity> findByStatus(String status);
    List<SimulationRunEntity> findByScenarioName(String scenarioName);
}
