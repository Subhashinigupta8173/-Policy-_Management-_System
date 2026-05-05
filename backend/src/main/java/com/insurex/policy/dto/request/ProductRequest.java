package com.insurex.policy.dto.request;

import com.insurex.policy.enums.ProductType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank
    private String name;

    @NotNull
    private ProductType type;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal basePremium;

    private String description;

    @NotNull
    private Integer minAge;

    @NotNull
    private Integer maxAge;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal coverageAmount;

    private String termsJson;

    private boolean active = true;
}
