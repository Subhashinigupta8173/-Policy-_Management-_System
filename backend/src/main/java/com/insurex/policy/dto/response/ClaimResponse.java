package com.insurex.policy.dto.response;

import com.insurex.policy.enums.ClaimStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse {
    private Long id;
    private String claimNumber;
    private Long policyId;
    private String policyNumber;
    private Long userId;
    private String customerName;
    private ClaimStatus status;
    private LocalDate incidentDate;
    private String description;
    private String proofDocPath;
    private String adjusterName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal settlementAmount;
}
