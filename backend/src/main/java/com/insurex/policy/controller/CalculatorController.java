package com.insurex.policy.controller;

import com.insurex.policy.dto.request.PremiumEstimateRequest;
import com.insurex.policy.dto.response.PremiumEstimateResponse;
import com.insurex.policy.service.PremiumCalculatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculator")
@RequiredArgsConstructor
public class CalculatorController {

    private final PremiumCalculatorService calculatorService;

    @PostMapping("/estimate")
    public ResponseEntity<PremiumEstimateResponse> estimate(
            @Valid @RequestBody PremiumEstimateRequest req) {
        return ResponseEntity.ok(calculatorService.estimate(req));
    }
}
