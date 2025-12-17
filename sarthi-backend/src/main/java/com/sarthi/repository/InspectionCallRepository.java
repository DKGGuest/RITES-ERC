package com.sarthi.repository;

import com.sarthi.entity.InspectionCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * Repository for Section B: Inspection Call Details
 */
@Repository
public interface InspectionCallRepository extends JpaRepository<InspectionCall, Long> {

    Optional<InspectionCall> findByInspectionCallNo(String inspectionCallNo);

    List<InspectionCall> findByProductType(String productType);

    List<InspectionCall> findByStageOfInspection(String stageOfInspection);

    boolean existsByInspectionCallNo(String inspectionCallNo);
}

