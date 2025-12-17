package com.sarthi.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO for Section D: Production Lines
 */
@Data
public class InspectionProductionLineDto {

    private Long id;
    private String inspectionCallNo;
    private Integer lineNumber;
    private String icNumber;
    private String poNumber;
    private List<String> rawMaterialIcs;
    private String productType;
    private Boolean isVerified;
    private String verifiedBy;
}

