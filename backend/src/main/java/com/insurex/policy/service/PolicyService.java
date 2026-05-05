package com.insurex.policy.service;

import com.insurex.policy.dto.request.PolicyApplyRequest;
import com.insurex.policy.dto.request.PremiumEstimateRequest;
import com.insurex.policy.dto.response.PolicyResponse;
import com.insurex.policy.dto.response.PremiumEstimateResponse;
import com.insurex.policy.entity.InsuranceProduct;
import com.insurex.policy.entity.Policy;
import com.insurex.policy.entity.User;
import com.insurex.policy.enums.PolicyStatus;
import com.insurex.policy.exception.AppException;
import com.insurex.policy.exception.ResourceNotFoundException;
import com.insurex.policy.repository.InsuranceProductRepository;
import com.insurex.policy.repository.PolicyRepository;
import com.insurex.policy.repository.UserRepository;
import com.insurex.policy.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final InsuranceProductRepository productRepository;
    private final UserRepository userRepository;
    private final PremiumCalculatorService calculatorService;
    private final StorageService storageService;
    private final PdfCertificateService pdfCertificateService;

    @Transactional
    public PolicyResponse apply(PolicyApplyRequest req, MultipartFile kycDoc, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        InsuranceProduct product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (req.getAge() < product.getMinAge() || req.getAge() > product.getMaxAge()) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Age " + req.getAge() + " is outside product range [" + product.getMinAge() + "," + product.getMaxAge() + "]");
        }

        PremiumEstimateRequest estimateReq = new PremiumEstimateRequest();
        estimateReq.setProductId(req.getProductId());
        estimateReq.setAge(req.getAge());
        estimateReq.setCoverageAmount(req.getCoverageAmount());
        estimateReq.setDurationYears(req.getDurationYears());
        estimateReq.setVehicleAge(req.getVehicleAge());
        PremiumEstimateResponse estimate = calculatorService.estimate(estimateReq);

        String kycPath = null;
        if (kycDoc != null && !kycDoc.isEmpty()) {
            kycPath = storageService.store(kycDoc, "kyc/");
        }

        String policyNumber = "POL-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        Policy policy = Policy.builder()
                .policyNumber(policyNumber)
                .user(user)
                .product(product)
                .status(PolicyStatus.PENDING)
                .premiumAmount(estimate.getEstimatedPremium())
                .startDate(req.getStartDate())
                .endDate(req.getStartDate().plusYears(req.getDurationYears()))
                .kycDocPath(kycPath)
                .build();

        return toResponse(policyRepository.save(policy));
    }

    @Transactional(readOnly = true)
    public List<PolicyResponse> getMyPolicies(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return policyRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PolicyResponse> getAllPolicies() {
        return policyRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public PolicyResponse approve(Long id) {
        Policy policy = findEntity(id);
        if (policy.getStatus() != PolicyStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Policy is not in PENDING state");
        }
        policy.setStatus(PolicyStatus.ACTIVE);
        return toResponse(policyRepository.save(policy));
    }

    @Transactional
    public PolicyResponse reject(Long id) {
        Policy policy = findEntity(id);
        if (policy.getStatus() != PolicyStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Policy is not in PENDING state");
        }
        policy.setStatus(PolicyStatus.REJECTED);
        return toResponse(policyRepository.save(policy));
    }

    @Transactional(readOnly = true)
    public Policy findEntity(Long id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + id));
    }

    @Transactional(readOnly = true)
    public byte[] generateCertificatePdf(Long id, String requestEmail, boolean isCustomer) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + id));
        if (isCustomer && !policy.getUser().getEmail().equals(requestEmail)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Certificate only available for ACTIVE policies");
        }
        // Access lazy associations inside the transaction before passing to PDF service
        policy.getUser().getName();
        policy.getProduct().getName();
        return pdfCertificateService.generateCertificate(policy);
    }

    private PolicyResponse toResponse(Policy p) {
        return PolicyResponse.builder()
                .id(p.getId())
                .policyNumber(p.getPolicyNumber())
                .userId(p.getUser().getId())
                .customerName(p.getUser().getName())
                .customerEmail(p.getUser().getEmail())
                .productId(p.getProduct().getId())
                .productName(p.getProduct().getName())
                .productType(p.getProduct().getType().name())
                .status(p.getStatus())
                .premiumAmount(p.getPremiumAmount())
                .coverageAmount(p.getProduct().getCoverageAmount())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .createdAt(p.getCreatedAt())
                .kycDocPath(p.getKycDocPath())
                .build();
    }
}
