package com.insurex.policy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalPolicies;
    private long pendingPolicies;
    private long activePolicies;
    private long rejectedPolicies;
    private long totalClaims;
    private long submittedClaims;
    private long underReviewClaims;
    private long approvedClaims;
    private long disbursedClaims;
    private long rejectedClaims;
    private BigDecimal totalRevenue;
    private Map<String, Long> policyStatusBreakdown;
    private Map<String, Long> claimStatusBreakdown;
}
