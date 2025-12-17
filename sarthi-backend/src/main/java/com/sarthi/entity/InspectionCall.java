package com.sarthi.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for Section B: Inspection Call Details
 */
@Entity
@Table(name = "inspection_call")
@Data
public class InspectionCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_call_no", nullable = false, unique = true)
    private String inspectionCallNo;

    @Column(name = "inspection_call_date", nullable = false)
    private LocalDate inspectionCallDate;

    @Column(name = "shift_of_inspection", nullable = false)
    private String shiftOfInspection;

    @Column(name = "date_of_inspection", nullable = false)
    private LocalDate dateOfInspection;

    @Column(name = "po_item_sr_no", nullable = false)
    private Integer poItemSrNo;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_type")
    private String productType;

    @Column(name = "po_qty")
    private Integer poQty;

    @Column(name = "call_qty")
    private Integer callQty;

    @Column(name = "offered_qty")
    private Integer offeredQty;

    @Column(name = "delivery_completion_period")
    private String deliveryCompletionPeriod;

    @Column(name = "rate", precision = 12, scale = 2)
    private BigDecimal rate;

    @Column(name = "place_of_inspection")
    private String placeOfInspection;

    @Column(name = "stage_of_inspection")
    private String stageOfInspection;

    @Column(name = "previous_ic_numbers", columnDefinition = "TEXT")
    private String previousIcNumbers;

    @Column(name = "vendor_remarks", columnDefinition = "TEXT")
    private String vendorRemarks;

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

