package com.sarthi.service;

import com.sarthi.dto.InspectionScheduleDto;
import java.util.List;

/**
 * Service interface for inspection schedule operations
 */
public interface InspectionScheduleService {

    /**
     * Schedule an inspection call
     */
    InspectionScheduleDto scheduleInspection(InspectionScheduleDto dto);

    /**
     * Reschedule an existing inspection call
     */
    InspectionScheduleDto rescheduleInspection(InspectionScheduleDto dto);

    /**
     * Get schedule status for a call
     */
    InspectionScheduleDto getScheduleByCallNo(String callNo);

    /**
     * Get all schedules (history) for a call
     */
    List<InspectionScheduleDto> getScheduleHistoryByCallNo(String callNo);

    /**
     * Check if a call is scheduled
     */
    boolean isCallScheduled(String callNo);

    /**
     * Get all scheduled calls
     */
    List<InspectionScheduleDto> getAllSchedules();
}

