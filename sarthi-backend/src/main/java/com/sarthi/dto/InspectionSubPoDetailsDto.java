package com.sarthi.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * DTO for Section C: Sub PO Details for Raw Material / Process
 */
@Data
public class InspectionSubPoDetailsDto {

    private Long id;
    private String inspectionCallNo;
    private String rawMaterialName;
    private String subPoNumber;
    private LocalDate subPoDate;
    private String contractor;
    private String manufacturer;
    private String placeOfInspection;
    private String billPayingOfficer;
    private String consignee;
    private Boolean isVerified;
    private String verifiedBy;
}

