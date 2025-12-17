package com.sarthi.service.Impl;

import com.sarthi.dto.InspectionCallDto;
import com.sarthi.dto.InspectionFormDataDto;
import com.sarthi.dto.InspectionPoDetailsDto;
import com.sarthi.dto.InspectionProductionLineDto;
import com.sarthi.dto.InspectionSubPoDetailsDto;
import com.sarthi.entity.InspectionCall;
import com.sarthi.entity.InspectionPoDetails;
import com.sarthi.entity.InspectionProductionLine;
import com.sarthi.entity.InspectionSubPoDetails;
import com.sarthi.repository.InspectionCallRepository;
import com.sarthi.repository.InspectionPoDetailsRepository;
import com.sarthi.repository.InspectionProductionLineRepository;
import com.sarthi.repository.InspectionSubPoDetailsRepository;
import com.sarthi.service.InspectionFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of InspectionFormService (Sections A, B, C, D)
 */
@Service
@Transactional
public class InspectionFormServiceImpl implements InspectionFormService {

    @Autowired
    private InspectionPoDetailsRepository poDetailsRepository;

    @Autowired
    private InspectionCallRepository callRepository;

    @Autowired
    private InspectionSubPoDetailsRepository subPoDetailsRepository;

    @Autowired
    private InspectionProductionLineRepository productionLineRepository;

    // ==================== Section A: PO Details ====================

    @Override
    public InspectionPoDetailsDto getPoDetailsByCallNo(String inspectionCallNo) {
        return poDetailsRepository.findByInspectionCallNo(inspectionCallNo)
                .map(this::mapToPoDetailsDto)
                .orElse(null);
    }

    @Override
    public InspectionPoDetailsDto savePoDetails(InspectionPoDetailsDto dto) {
        InspectionPoDetails entity = mapToPoDetailsEntity(dto);
        InspectionPoDetails saved = poDetailsRepository.save(entity);
        return mapToPoDetailsDto(saved);
    }

    @Override
    public InspectionPoDetailsDto verifyPoDetails(String inspectionCallNo, String verifiedBy) {
        InspectionPoDetails entity = poDetailsRepository.findByInspectionCallNo(inspectionCallNo)
                .orElse(null);
        if (entity != null) {
            entity.setIsVerified(true);
            entity.setVerifiedBy(verifiedBy);
            entity.setVerifiedAt(LocalDateTime.now());
            return mapToPoDetailsDto(poDetailsRepository.save(entity));
        }
        return null;
    }

    // ==================== Section B: Inspection Call ====================

    @Override
    public InspectionCallDto getCallDetailsByCallNo(String inspectionCallNo) {
        return callRepository.findByInspectionCallNo(inspectionCallNo)
                .map(this::mapToCallDto)
                .orElse(null);
    }

    @Override
    public InspectionCallDto saveCallDetails(InspectionCallDto dto) {
        InspectionCall entity = mapToCallEntity(dto);
        InspectionCall saved = callRepository.save(entity);
        return mapToCallDto(saved);
    }

    @Override
    public InspectionCallDto updateCallDetails(InspectionCallDto dto) {
        InspectionCall existing = callRepository.findByInspectionCallNo(dto.getInspectionCallNo())
                .orElse(null);
        if (existing != null) {
            // Update editable fields
            existing.setShiftOfInspection(dto.getShiftOfInspection());
            existing.setDateOfInspection(dto.getDateOfInspection());
            existing.setOfferedQty(dto.getOfferedQty());
            return mapToCallDto(callRepository.save(existing));
        }
        return saveCallDetails(dto);
    }

    @Override
    public InspectionCallDto verifyCallDetails(String inspectionCallNo, String verifiedBy) {
        InspectionCall entity = callRepository.findByInspectionCallNo(inspectionCallNo)
                .orElse(null);
        if (entity != null) {
            entity.setIsVerified(true);
            entity.setVerifiedBy(verifiedBy);
            entity.setVerifiedAt(LocalDateTime.now());
            return mapToCallDto(callRepository.save(entity));
        }
        return null;
    }

    // ==================== Section C: Sub PO Details ====================

    @Override
    public InspectionSubPoDetailsDto getSubPoDetailsByCallNo(String inspectionCallNo) {
        return subPoDetailsRepository.findByInspectionCallNo(inspectionCallNo)
                .map(this::mapToSubPoDetailsDto)
                .orElse(null);
    }

    @Override
    public InspectionSubPoDetailsDto saveSubPoDetails(InspectionSubPoDetailsDto dto) {
        InspectionSubPoDetails entity = mapToSubPoDetailsEntity(dto);
        InspectionSubPoDetails saved = subPoDetailsRepository.save(entity);
        return mapToSubPoDetailsDto(saved);
    }

    @Override
    public InspectionSubPoDetailsDto verifySubPoDetails(String inspectionCallNo, String verifiedBy) {
        InspectionSubPoDetails entity = subPoDetailsRepository.findByInspectionCallNo(inspectionCallNo)
                .orElse(null);
        if (entity != null) {
            entity.setIsVerified(true);
            entity.setVerifiedBy(verifiedBy);
            entity.setVerifiedAt(LocalDateTime.now());
            return mapToSubPoDetailsDto(subPoDetailsRepository.save(entity));
        }
        return null;
    }

    // ==================== Section D: Production Lines ====================

    @Override
    public List<InspectionProductionLineDto> getProductionLinesByCallNo(String inspectionCallNo) {
        return productionLineRepository.findByInspectionCallNo(inspectionCallNo)
                .stream()
                .map(this::mapToProductionLineDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InspectionProductionLineDto> saveProductionLines(String inspectionCallNo, List<InspectionProductionLineDto> lines) {
        // Delete existing lines and save new ones
        productionLineRepository.deleteByInspectionCallNo(inspectionCallNo);

        return lines.stream().map(dto -> {
            dto.setInspectionCallNo(inspectionCallNo);
            InspectionProductionLine entity = mapToProductionLineEntity(dto);
            InspectionProductionLine saved = productionLineRepository.save(entity);
            return mapToProductionLineDto(saved);
        }).collect(Collectors.toList());
    }

    @Override
    public List<InspectionProductionLineDto> verifyProductionLines(String inspectionCallNo, String verifiedBy) {
        List<InspectionProductionLine> lines = productionLineRepository.findByInspectionCallNo(inspectionCallNo);
        lines.forEach(line -> {
            line.setIsVerified(true);
            line.setVerifiedBy(verifiedBy);
            line.setVerifiedAt(LocalDateTime.now());
        });
        productionLineRepository.saveAll(lines);
        return lines.stream().map(this::mapToProductionLineDto).collect(Collectors.toList());
    }

    // ==================== Combined Form Data ====================

    @Override
    public InspectionFormDataDto getFormDataByCallNo(String inspectionCallNo) {
        InspectionPoDetailsDto poDetails = getPoDetailsByCallNo(inspectionCallNo);
        InspectionCallDto callDetails = getCallDetailsByCallNo(inspectionCallNo);
        InspectionSubPoDetailsDto subPoDetails = getSubPoDetailsByCallNo(inspectionCallNo);

        return new InspectionFormDataDto(poDetails, callDetails, subPoDetails);
    }

    // ==================== Mapper Methods ====================

    private InspectionPoDetailsDto mapToPoDetailsDto(InspectionPoDetails entity) {
        InspectionPoDetailsDto dto = new InspectionPoDetailsDto();
        dto.setId(entity.getId());
        dto.setInspectionCallNo(entity.getInspectionCallNo());
        dto.setPoNumber(entity.getPoNumber());
        dto.setPoDate(entity.getPoDate());
        dto.setPoAmendmentNumbers(entity.getPoAmendmentNumbers());
        dto.setPoAmendmentDates(entity.getPoAmendmentDates());
        dto.setProductName(entity.getProductName());
        dto.setPlNumber(entity.getPlNumber());
        dto.setVendorName(entity.getVendorName());
        dto.setPurchasingAuthority(entity.getPurchasingAuthority());
        dto.setBillPayingOfficer(entity.getBillPayingOfficer());
        dto.setPoQuantity(entity.getPoQuantity());
        dto.setDeliveryPeriod(entity.getDeliveryPeriod());
        dto.setPlaceOfInspection(entity.getPlaceOfInspection());
        dto.setInspectionFeePaymentDetails(entity.getInspectionFeePaymentDetails());
        dto.setIsVerified(entity.getIsVerified());
        dto.setVerifiedBy(entity.getVerifiedBy());
        return dto;
    }

    private InspectionPoDetails mapToPoDetailsEntity(InspectionPoDetailsDto dto) {
        InspectionPoDetails entity = new InspectionPoDetails();
        entity.setId(dto.getId());
        entity.setInspectionCallNo(dto.getInspectionCallNo());
        entity.setPoNumber(dto.getPoNumber());
        entity.setPoDate(dto.getPoDate());
        entity.setPoAmendmentNumbers(dto.getPoAmendmentNumbers());
        entity.setPoAmendmentDates(dto.getPoAmendmentDates());
        entity.setProductName(dto.getProductName());
        entity.setPlNumber(dto.getPlNumber());
        entity.setVendorName(dto.getVendorName());
        entity.setPurchasingAuthority(dto.getPurchasingAuthority());
        entity.setBillPayingOfficer(dto.getBillPayingOfficer());
        entity.setPoQuantity(dto.getPoQuantity());
        entity.setDeliveryPeriod(dto.getDeliveryPeriod());
        entity.setPlaceOfInspection(dto.getPlaceOfInspection());
        entity.setInspectionFeePaymentDetails(dto.getInspectionFeePaymentDetails());
        return entity;
    }

    private InspectionCallDto mapToCallDto(InspectionCall entity) {
        InspectionCallDto dto = new InspectionCallDto();
        dto.setId(entity.getId());
        dto.setInspectionCallNo(entity.getInspectionCallNo());
        dto.setInspectionCallDate(entity.getInspectionCallDate());
        dto.setShiftOfInspection(entity.getShiftOfInspection());
        dto.setDateOfInspection(entity.getDateOfInspection());
        dto.setPoItemSrNo(entity.getPoItemSrNo());
        dto.setProductName(entity.getProductName());
        dto.setProductType(entity.getProductType());
        dto.setPoQty(entity.getPoQty());
        dto.setCallQty(entity.getCallQty());
        dto.setOfferedQty(entity.getOfferedQty());
        dto.setDeliveryCompletionPeriod(entity.getDeliveryCompletionPeriod());
        dto.setRate(entity.getRate());
        dto.setPlaceOfInspection(entity.getPlaceOfInspection());
        dto.setStageOfInspection(entity.getStageOfInspection());
        dto.setPreviousIcNumbers(entity.getPreviousIcNumbers());
        dto.setVendorRemarks(entity.getVendorRemarks());
        dto.setIsVerified(entity.getIsVerified());
        dto.setVerifiedBy(entity.getVerifiedBy());
        return dto;
    }

    private InspectionCall mapToCallEntity(InspectionCallDto dto) {
        InspectionCall entity = new InspectionCall();
        entity.setId(dto.getId());
        entity.setInspectionCallNo(dto.getInspectionCallNo());
        entity.setInspectionCallDate(dto.getInspectionCallDate());
        entity.setShiftOfInspection(dto.getShiftOfInspection());
        entity.setDateOfInspection(dto.getDateOfInspection());
        entity.setPoItemSrNo(dto.getPoItemSrNo());
        entity.setProductName(dto.getProductName());
        entity.setProductType(dto.getProductType());
        entity.setPoQty(dto.getPoQty());
        entity.setCallQty(dto.getCallQty());
        entity.setOfferedQty(dto.getOfferedQty());
        entity.setDeliveryCompletionPeriod(dto.getDeliveryCompletionPeriod());
        entity.setRate(dto.getRate());
        entity.setPlaceOfInspection(dto.getPlaceOfInspection());
        entity.setStageOfInspection(dto.getStageOfInspection());
        entity.setPreviousIcNumbers(dto.getPreviousIcNumbers());
        entity.setVendorRemarks(dto.getVendorRemarks());
        return entity;
    }

    private InspectionSubPoDetailsDto mapToSubPoDetailsDto(InspectionSubPoDetails entity) {
        InspectionSubPoDetailsDto dto = new InspectionSubPoDetailsDto();
        dto.setId(entity.getId());
        dto.setInspectionCallNo(entity.getInspectionCallNo());
        dto.setRawMaterialName(entity.getRawMaterialName());
        dto.setSubPoNumber(entity.getSubPoNumber());
        dto.setSubPoDate(entity.getSubPoDate());
        dto.setContractor(entity.getContractor());
        dto.setManufacturer(entity.getManufacturer());
        dto.setPlaceOfInspection(entity.getPlaceOfInspection());
        dto.setBillPayingOfficer(entity.getBillPayingOfficer());
        dto.setConsignee(entity.getConsignee());
        dto.setIsVerified(entity.getIsVerified());
        dto.setVerifiedBy(entity.getVerifiedBy());
        return dto;
    }

    private InspectionSubPoDetails mapToSubPoDetailsEntity(InspectionSubPoDetailsDto dto) {
        InspectionSubPoDetails entity = new InspectionSubPoDetails();
        entity.setId(dto.getId());
        entity.setInspectionCallNo(dto.getInspectionCallNo());
        entity.setRawMaterialName(dto.getRawMaterialName());
        entity.setSubPoNumber(dto.getSubPoNumber());
        entity.setSubPoDate(dto.getSubPoDate());
        entity.setContractor(dto.getContractor());
        entity.setManufacturer(dto.getManufacturer());
        entity.setPlaceOfInspection(dto.getPlaceOfInspection());
        entity.setBillPayingOfficer(dto.getBillPayingOfficer());
        entity.setConsignee(dto.getConsignee());
        return entity;
    }

    // ==================== Production Line Mappers ====================

    private InspectionProductionLineDto mapToProductionLineDto(InspectionProductionLine entity) {
        InspectionProductionLineDto dto = new InspectionProductionLineDto();
        dto.setId(entity.getId());
        dto.setInspectionCallNo(entity.getInspectionCallNo());
        dto.setLineNumber(entity.getLineNumber());
        dto.setIcNumber(entity.getIcNumber());
        dto.setPoNumber(entity.getPoNumber());
        // Convert comma-separated string to list
        if (entity.getRawMaterialIcs() != null && !entity.getRawMaterialIcs().isEmpty()) {
            dto.setRawMaterialIcs(Arrays.asList(entity.getRawMaterialIcs().split(",")));
        }
        dto.setProductType(entity.getProductType());
        dto.setIsVerified(entity.getIsVerified());
        dto.setVerifiedBy(entity.getVerifiedBy());
        return dto;
    }

    private InspectionProductionLine mapToProductionLineEntity(InspectionProductionLineDto dto) {
        InspectionProductionLine entity = new InspectionProductionLine();
        entity.setId(dto.getId());
        entity.setInspectionCallNo(dto.getInspectionCallNo());
        entity.setLineNumber(dto.getLineNumber());
        entity.setIcNumber(dto.getIcNumber());
        entity.setPoNumber(dto.getPoNumber());
        // Convert list to comma-separated string
        if (dto.getRawMaterialIcs() != null && !dto.getRawMaterialIcs().isEmpty()) {
            entity.setRawMaterialIcs(String.join(",", dto.getRawMaterialIcs()));
        }
        entity.setProductType(dto.getProductType());
        return entity;
    }
}

