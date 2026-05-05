package com.insurex.policy.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDashboardResponse {
    private long activePolicies;
    private long pendingClaims;
    private long upcomingRenewals;
    private List<PolicyResponse> recentPolicies;
}
