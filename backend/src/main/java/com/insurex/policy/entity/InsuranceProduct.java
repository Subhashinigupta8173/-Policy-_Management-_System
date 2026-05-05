package com.insurex.policy.entity;

import com.insurex.policy.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "insurance_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal basePremium;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer minAge;

    @Column(nullable = false)
    private Integer maxAge;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal coverageAmount;

    @Column(columnDefinition = "TEXT")
    private String termsJson;

    @Column(nullable = false)
    private boolean active;
}
