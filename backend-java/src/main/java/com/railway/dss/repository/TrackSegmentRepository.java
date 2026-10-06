package com.railway.dss.repository;

import com.railway.dss.entity.TrackSegmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface TrackSegmentRepository extends JpaRepository<TrackSegmentEntity, Long> {
    Optional<TrackSegmentEntity> findBySegmentId(String segmentId);
    List<TrackSegmentEntity> findByIsBlockedTrue();
    List<TrackSegmentEntity> findAllByOrderByStartKmAsc();
}
