package com.insurex.policy.dto.response;

import com.insurex.policy.enums.ProductType;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private ProductType type;
    private BigDecimal basePremium;
    private String description;
    private Integer minAge;
    private Integer maxAge;
    private BigDecimal coverageAmount;
    private String termsJson;
    private boolean active;
}
