package com.sarthi.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * DTO for Section A: Main PO Information
 */
@Data
public class InspectionPoDetailsDto {

    private Long id;
    private String inspectionCallNo;
    private String poNumber;
    private LocalDate poDate;
    private String poAmendmentNumbers;
    private String poAmendmentDates;
    private String productName;
    private String plNumber;
    private String vendorName;
    private String purchasingAuthority;
    private String billPayingOfficer;
    private Integer poQuantity;
    private String deliveryPeriod;
    private String placeOfInspection;
    private String inspectionFeePaymentDetails;
    private Boolean isVerified;
    private String verifiedBy;
}

