package com.insurex.policy.dto.request;

import com.insurex.policy.enums.ClaimStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ClaimStatusUpdateRequest {
    @NotNull
    private ClaimStatus targetStatus;

    private BigDecimal settlementAmount;
}
