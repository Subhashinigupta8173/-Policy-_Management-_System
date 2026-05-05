package com.insurex.policy.service;

import com.insurex.policy.dto.request.PremiumEstimateRequest;
import com.insurex.policy.dto.response.PremiumEstimateResponse;
import com.insurex.policy.entity.InsuranceProduct;
import com.insurex.policy.enums.ProductType;
import com.insurex.policy.exception.ResourceNotFoundException;
import com.insurex.policy.repository.InsuranceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class PremiumCalculatorService {

    private final InsuranceProductRepository productRepository;

    public PremiumEstimateResponse estimate(PremiumEstimateRequest req) {
        InsuranceProduct product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + req.getProductId()));

        BigDecimal base = product.getBasePremium();

        double ageFactor = computeAgeFactor(req.getAge(), product.getType());
        double durationFactor = 1.0 + (req.getDurationYears() - 1) * 0.05;
        double coverageFactor = req.getCoverageAmount()
                .divide(product.getCoverageAmount(), 6, RoundingMode.HALF_UP)
                .doubleValue();

        double multiplier = ageFactor * durationFactor * coverageFactor;

        if (product.getType() == ProductType.VEHICLE && req.getVehicleAge() != null) {
            multiplier *= computeVehicleAgeFactor(req.getVehicleAge());
        }

        BigDecimal annual = base.multiply(BigDecimal.valueOf(multiplier))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = annual.multiply(BigDecimal.valueOf(req.getDurationYears()));

        String breakdown = String.format(
                "base=%.2f × age=%.2f × duration=%.2f × coverage=%.4f = %.2f/year",
                base.doubleValue(), ageFactor, durationFactor, coverageFactor, annual.doubleValue());

        return PremiumEstimateResponse.builder()
                .estimatedPremium(annual)
                .totalPremium(total)
                .breakdown(breakdown)
                .build();
    }

    private double computeAgeFactor(int age, ProductType type) {
        if (type == ProductType.VEHICLE) return 1.0;
        if (age <= 30) return 1.0;
        if (age <= 45) return 1.3;
        if (age <= 60) return 1.6;
        return 2.0;
    }

    private double computeVehicleAgeFactor(int vehicleAge) {
        if (vehicleAge <= 3) return 1.0;
        if (vehicleAge <= 7) return 1.15;
        return 1.35;
    }
}
