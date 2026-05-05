package com.insurex.policy.controller;

import com.insurex.policy.dto.request.ClaimStatusUpdateRequest;
import com.insurex.policy.dto.request.ClaimSubmitRequest;
import com.insurex.policy.dto.response.ClaimResponse;
import com.insurex.policy.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ClaimResponse> submit(
            @RequestPart("data") @Valid ClaimSubmitRequest req,
            @RequestPart(value = "proofDoc", required = false) MultipartFile proofDoc,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(claimService.submit(req, proofDoc, auth.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ClaimResponse>> myClaims(Authentication auth) {
        return ResponseEntity.ok(claimService.getMyClaims(auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADJUSTER')")
    public ResponseEntity<List<ClaimResponse>> allClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADJUSTER')")
    public ResponseEntity<ClaimResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ClaimStatusUpdateRequest req,
            Authentication auth) {
        return ResponseEntity.ok(claimService.updateStatus(id, req, auth.getName()));
    }
}
