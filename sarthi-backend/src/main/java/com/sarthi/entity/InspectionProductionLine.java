package com.sarthi.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Entity for Section D: Production Lines (Process Inspection)
 * Table: inspection_production_lines
 */
@Data
@Entity
@Table(name = "inspection_production_lines")
public class InspectionProductionLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_call_no", nullable = false, length = 50)
    private String inspectionCallNo;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(name = "ic_number", length = 50)
    private String icNumber;

    @Column(name = "po_number", length = 50)
    private String poNumber;

    @Column(name = "raw_material_ics", columnDefinition = "TEXT")
    private String rawMaterialIcs;

    @Column(name = "product_type", length = 50)
    private String productType;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verified_by", length = 50)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

