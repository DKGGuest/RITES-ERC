package com.sarthi.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for Section A: Main PO Information (Auto-Fetched)
 */
@Entity
@Table(name = "inspection_po_details")
@Data
public class InspectionPoDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_call_no", nullable = false)
    private String inspectionCallNo;

    @Column(name = "po_number", nullable = false)
    private String poNumber;

    @Column(name = "po_date", nullable = false)
    private LocalDate poDate;

    @Column(name = "po_amendment_numbers")
    private String poAmendmentNumbers;

    @Column(name = "po_amendment_dates")
    private String poAmendmentDates;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "pl_number")
    private String plNumber;

    @Column(name = "vendor_name")
    private String vendorName;

    @Column(name = "purchasing_authority")
    private String purchasingAuthority;

    @Column(name = "bill_paying_officer")
    private String billPayingOfficer;

    @Column(name = "po_quantity")
    private Integer poQuantity;

    @Column(name = "delivery_period")
    private String deliveryPeriod;

    @Column(name = "place_of_inspection")
    private String placeOfInspection;

    @Column(name = "inspection_fee_payment_details", columnDefinition = "TEXT")
    private String inspectionFeePaymentDetails;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

