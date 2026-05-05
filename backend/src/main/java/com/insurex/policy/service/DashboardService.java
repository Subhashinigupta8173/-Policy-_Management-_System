package com.insurex.policy.service;

import com.insurex.policy.dto.response.AdminDashboardResponse;
import com.insurex.policy.dto.response.CustomerDashboardResponse;
import com.insurex.policy.dto.response.PolicyResponse;
import com.insurex.policy.entity.Policy;
import com.insurex.policy.entity.User;
import com.insurex.policy.enums.ClaimStatus;
import com.insurex.policy.enums.PolicyStatus;
import com.insurex.policy.repository.ClaimRepository;
import com.insurex.policy.repository.PolicyRepository;
import com.insurex.policy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CustomerDashboardResponse customerDashboard(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Policy> myPolicies = policyRepository.findByUserId(user.getId());

        long activePolicies = myPolicies.stream()
                .filter(p -> p.getStatus() == PolicyStatus.ACTIVE).count();
        long pendingClaims = claimRepository.findByUserId(user.getId()).stream()
                .filter(c -> c.getStatus() == ClaimStatus.SUBMITTED
                        || c.getStatus() == ClaimStatus.UNDER_REVIEW).count();
        long upcomingRenewals = myPolicies.stream()
                .filter(p -> p.getStatus() == PolicyStatus.ACTIVE
                        && p.getEndDate() != null
                        && !p.getEndDate().isBefore(LocalDate.now())
                        && !p.getEndDate().isAfter(LocalDate.now().plusDays(30))).count();

        List<PolicyResponse> recent = myPolicies.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(this::policyToResponse)
                .toList();

        return CustomerDashboardResponse.builder()
                .activePolicies(activePolicies)
                .pendingClaims(pendingClaims)
                .upcomingRenewals(upcomingRenewals)
                .recentPolicies(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse adminDashboard() {
        long totalPolicies   = policyRepository.count();
        long pending         = policyRepository.countByStatus(PolicyStatus.PENDING);
        long active          = policyRepository.countByStatus(PolicyStatus.ACTIVE);
        long rejected        = policyRepository.countByStatus(PolicyStatus.REJECTED);
        long totalClaims     = claimRepository.count();
        long submitted       = claimRepository.countByStatus(ClaimStatus.SUBMITTED);
        long underReview     = claimRepository.countByStatus(ClaimStatus.UNDER_REVIEW);
        long approved        = claimRepository.countByStatus(ClaimStatus.APPROVED);
        long disbursed       = claimRepository.countByStatus(ClaimStatus.DISBURSED);
        long rejectedClaims  = claimRepository.countByStatus(ClaimStatus.REJECTED);
        BigDecimal revenue   = policyRepository.sumActivePremiums();
        if (revenue == null) revenue = BigDecimal.ZERO;

        Map<String, Long> policyBreakdown = new LinkedHashMap<>();
        policyBreakdown.put("ACTIVE", active);
        policyBreakdown.put("PENDING", pending);
        policyBreakdown.put("REJECTED", rejected);

        Map<String, Long> claimBreakdown = new LinkedHashMap<>();
        claimBreakdown.put("SUBMITTED", submitted);
        claimBreakdown.put("UNDER_REVIEW", underReview);
        claimBreakdown.put("APPROVED", approved);
        claimBreakdown.put("DISBURSED", disbursed);
        claimBreakdown.put("REJECTED", rejectedClaims);

        return AdminDashboardResponse.builder()
                .totalPolicies(totalPolicies)
                .pendingPolicies(pending)
                .activePolicies(active)
                .rejectedPolicies(rejected)
                .totalClaims(totalClaims)
                .submittedClaims(submitted)
                .underReviewClaims(underReview)
                .approvedClaims(approved)
                .disbursedClaims(disbursed)
                .rejectedClaims(rejectedClaims)
                .totalRevenue(revenue)
                .policyStatusBreakdown(policyBreakdown)
                .claimStatusBreakdown(claimBreakdown)
                .build();
    }

    private PolicyResponse policyToResponse(Policy p) {
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
                .build();
    }
}
