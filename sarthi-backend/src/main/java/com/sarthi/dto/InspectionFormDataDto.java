package com.sarthi.dto;

import lombok.Data;

/**
 * Combined DTO for fetching all inspection form data (Sections A, B, C)
 */
@Data
public class InspectionFormDataDto {

    private InspectionPoDetailsDto poDetails;        // Section A
    private InspectionCallDto callDetails;           // Section B
    private InspectionSubPoDetailsDto subPoDetails;  // Section C

    public InspectionFormDataDto() {
    }

    public InspectionFormDataDto(InspectionPoDetailsDto poDetails, 
                                  InspectionCallDto callDetails, 
                                  InspectionSubPoDetailsDto subPoDetails) {
        this.poDetails = poDetails;
        this.callDetails = callDetails;
        this.subPoDetails = subPoDetails;
    }
}

