package com.insurex.policy.controller;

import com.insurex.policy.dto.request.PolicyApplyRequest;
import com.insurex.policy.dto.response.PolicyResponse;
import com.insurex.policy.service.PolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PolicyResponse> apply(
            @RequestPart("data") @Valid PolicyApplyRequest req,
            @RequestPart(value = "kycDoc", required = false) MultipartFile kycDoc,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(policyService.apply(req, kycDoc, auth.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<PolicyResponse>> myPolicies(Authentication auth) {
        return ResponseEntity.ok(policyService.getMyPolicies(auth.getName()));
    }

    @GetMapping("/{id}/certificate")
    public ResponseEntity<byte[]> certificate(@PathVariable Long id, Authentication auth) {
        boolean isCustomer = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        byte[] pdf = policyService.generateCertificatePdf(id, auth.getName(), isCustomer);
        String filename = "certificate-" + id + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping
    @PreAuthorize("hasRole('UNDERWRITER')")
    public ResponseEntity<List<PolicyResponse>> allPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public ResponseEntity<PolicyResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.approve(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('UNDERWRITER')")
    public ResponseEntity<PolicyResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.reject(id));
    }
}
