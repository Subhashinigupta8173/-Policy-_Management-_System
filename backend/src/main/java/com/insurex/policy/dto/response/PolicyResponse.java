package com.insurex.policy.dto.response;

import com.insurex.policy.enums.PolicyStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyResponse {
    private Long id;
    private String policyNumber;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private Long productId;
    private String productName;
    private String productType;
    private PolicyStatus status;
    private BigDecimal premiumAmount;
    private BigDecimal coverageAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private String kycDocPath;
}
