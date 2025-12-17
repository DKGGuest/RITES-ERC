package com.sarthi.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for Section C: Sub PO Details for Raw Material / Process
 */
@Entity
@Table(name = "inspection_sub_po_details")
@Data
public class InspectionSubPoDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_call_no", nullable = false)
    private String inspectionCallNo;

    @Column(name = "raw_material_name")
    private String rawMaterialName;

    @Column(name = "sub_po_number")
    private String subPoNumber;

    @Column(name = "sub_po_date")
    private LocalDate subPoDate;

    @Column(name = "contractor")
    private String contractor;

    @Column(name = "manufacturer")
    private String manufacturer;

    @Column(name = "place_of_inspection")
    private String placeOfInspection;

    @Column(name = "bill_paying_officer")
    private String billPayingOfficer;

    @Column(name = "consignee")
    private String consignee;

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

