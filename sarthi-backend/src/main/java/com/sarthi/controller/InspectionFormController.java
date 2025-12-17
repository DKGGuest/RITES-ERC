package com.sarthi.controller;

import com.sarthi.dto.InspectionCallDto;
import com.sarthi.dto.InspectionFormDataDto;
import com.sarthi.dto.InspectionPoDetailsDto;
import com.sarthi.dto.InspectionProductionLineDto;
import com.sarthi.dto.InspectionSubPoDetailsDto;
import com.sarthi.service.InspectionFormService;
import com.sarthi.util.ResponseBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Inspection Form APIs (Sections A, B, C, D)
 * All endpoints require JWT authentication
 */
@RestController
@RequestMapping("/api/inspection-form")
public class InspectionFormController {

    @Autowired
    private InspectionFormService inspectionFormService;

    // ==================== Combined Form Data ====================

    /**
     * Get all form data (Sections A, B, C) by inspection call number
     */
    @GetMapping("/{callNo}")
    public ResponseEntity<Object> getFormDataByCallNo(@PathVariable String callNo) {
        InspectionFormDataDto formData = inspectionFormService.getFormDataByCallNo(callNo);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(formData), HttpStatus.OK);
    }

    // ==================== Section A: PO Details ====================

    @GetMapping("/po-details/{callNo}")
    public ResponseEntity<Object> getPoDetailsByCallNo(@PathVariable String callNo) {
        InspectionPoDetailsDto dto = inspectionFormService.getPoDetailsByCallNo(callNo);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(dto), HttpStatus.OK);
    }

    @PostMapping("/po-details")
    public ResponseEntity<Object> savePoDetails(@RequestBody InspectionPoDetailsDto dto) {
        InspectionPoDetailsDto saved = inspectionFormService.savePoDetails(dto);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(saved), HttpStatus.OK);
    }

    @PutMapping("/po-details/verify/{callNo}")
    public ResponseEntity<Object> verifyPoDetails(
            @PathVariable String callNo,
            @RequestParam String verifiedBy) {
        InspectionPoDetailsDto verified = inspectionFormService.verifyPoDetails(callNo, verifiedBy);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(verified), HttpStatus.OK);
    }

    // ==================== Section B: Inspection Call ====================

    @GetMapping("/call-details/{callNo}")
    public ResponseEntity<Object> getCallDetailsByCallNo(@PathVariable String callNo) {
        InspectionCallDto dto = inspectionFormService.getCallDetailsByCallNo(callNo);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(dto), HttpStatus.OK);
    }

    @PostMapping("/call-details")
    public ResponseEntity<Object> saveCallDetails(@RequestBody InspectionCallDto dto) {
        InspectionCallDto saved = inspectionFormService.saveCallDetails(dto);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(saved), HttpStatus.OK);
    }

    @PutMapping("/call-details")
    public ResponseEntity<Object> updateCallDetails(@RequestBody InspectionCallDto dto) {
        InspectionCallDto updated = inspectionFormService.updateCallDetails(dto);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(updated), HttpStatus.OK);
    }

    @PutMapping("/call-details/verify/{callNo}")
    public ResponseEntity<Object> verifyCallDetails(
            @PathVariable String callNo,
            @RequestParam String verifiedBy) {
        InspectionCallDto verified = inspectionFormService.verifyCallDetails(callNo, verifiedBy);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(verified), HttpStatus.OK);
    }

    // ==================== Section C: Sub PO Details ====================

    @GetMapping("/sub-po-details/{callNo}")
    public ResponseEntity<Object> getSubPoDetailsByCallNo(@PathVariable String callNo) {
        InspectionSubPoDetailsDto dto = inspectionFormService.getSubPoDetailsByCallNo(callNo);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(dto), HttpStatus.OK);
    }

    @PostMapping("/sub-po-details")
    public ResponseEntity<Object> saveSubPoDetails(@RequestBody InspectionSubPoDetailsDto dto) {
        InspectionSubPoDetailsDto saved = inspectionFormService.saveSubPoDetails(dto);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(saved), HttpStatus.OK);
    }

    @PutMapping("/sub-po-details/verify/{callNo}")
    public ResponseEntity<Object> verifySubPoDetails(
            @PathVariable String callNo,
            @RequestParam String verifiedBy) {
        InspectionSubPoDetailsDto verified = inspectionFormService.verifySubPoDetails(callNo, verifiedBy);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(verified), HttpStatus.OK);
    }

    // ==================== Section D: Production Lines (Process Inspection) ====================

    /**
     * Get all production lines by inspection call number
     */
    @GetMapping("/production-lines/{callNo}")
    public ResponseEntity<Object> getProductionLinesByCallNo(@PathVariable String callNo) {
        List<InspectionProductionLineDto> lines = inspectionFormService.getProductionLinesByCallNo(callNo);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(lines), HttpStatus.OK);
    }

    /**
     * Save production lines for an inspection call
     */
    @PostMapping("/production-lines/{callNo}")
    public ResponseEntity<Object> saveProductionLines(
            @PathVariable String callNo,
            @RequestBody List<InspectionProductionLineDto> lines) {
        List<InspectionProductionLineDto> saved = inspectionFormService.saveProductionLines(callNo, lines);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(saved), HttpStatus.OK);
    }

    /**
     * Verify all production lines for an inspection call
     */
    @PutMapping("/production-lines/verify/{callNo}")
    public ResponseEntity<Object> verifyProductionLines(
            @PathVariable String callNo,
            @RequestParam String verifiedBy) {
        List<InspectionProductionLineDto> verified = inspectionFormService.verifyProductionLines(callNo, verifiedBy);
        return new ResponseEntity<>(ResponseBuilder.getSuccessResponse(verified), HttpStatus.OK);
    }
}

