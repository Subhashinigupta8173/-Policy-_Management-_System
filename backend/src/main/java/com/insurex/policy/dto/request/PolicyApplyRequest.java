package com.insurex.policy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PolicyApplyRequest {
    @NotNull
    private Long productId;

    @NotNull
    @Min(1)
    @Max(120)
    private Integer age;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal coverageAmount;

    @NotNull
    @Min(1)
    private Integer durationYears;

    private Integer vehicleAge;

    @NotNull
    private LocalDate startDate;

    private String nomineeName;
    private String nomineeRelationship;
}
