package com.insurex.policy.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PremiumEstimateResponse {
    private BigDecimal estimatedPremium;
    private BigDecimal totalPremium;
    private String breakdown;
}
