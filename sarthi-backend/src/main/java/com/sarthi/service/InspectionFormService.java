package com.sarthi.service;

import com.sarthi.dto.InspectionCallDto;
import com.sarthi.dto.InspectionFormDataDto;
import com.sarthi.dto.InspectionPoDetailsDto;
import com.sarthi.dto.InspectionProductionLineDto;
import com.sarthi.dto.InspectionSubPoDetailsDto;

import java.util.List;

/**
 * Service interface for Inspection Form data (Sections A, B, C, D)
 */
public interface InspectionFormService {

    // Section A: PO Details
    InspectionPoDetailsDto getPoDetailsByCallNo(String inspectionCallNo);
    InspectionPoDetailsDto savePoDetails(InspectionPoDetailsDto dto);
    InspectionPoDetailsDto verifyPoDetails(String inspectionCallNo, String verifiedBy);

    // Section B: Inspection Call Details
    InspectionCallDto getCallDetailsByCallNo(String inspectionCallNo);
    InspectionCallDto saveCallDetails(InspectionCallDto dto);
    InspectionCallDto updateCallDetails(InspectionCallDto dto);
    InspectionCallDto verifyCallDetails(String inspectionCallNo, String verifiedBy);

    // Section C: Sub PO Details
    InspectionSubPoDetailsDto getSubPoDetailsByCallNo(String inspectionCallNo);
    InspectionSubPoDetailsDto saveSubPoDetails(InspectionSubPoDetailsDto dto);
    InspectionSubPoDetailsDto verifySubPoDetails(String inspectionCallNo, String verifiedBy);

    // Section D: Production Lines (Process Inspection)
    List<InspectionProductionLineDto> getProductionLinesByCallNo(String inspectionCallNo);
    List<InspectionProductionLineDto> saveProductionLines(String inspectionCallNo, List<InspectionProductionLineDto> lines);
    List<InspectionProductionLineDto> verifyProductionLines(String inspectionCallNo, String verifiedBy);

    // Combined: Get all form data by call number
    InspectionFormDataDto getFormDataByCallNo(String inspectionCallNo);
}

