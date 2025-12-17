package com.sarthi.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Inspection Schedule request and response
 */
@Data
public class InspectionScheduleDto {
    
    private Long id;
    private String callNo;
    private LocalDate scheduleDate;
    private String reason;
    private String status;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

