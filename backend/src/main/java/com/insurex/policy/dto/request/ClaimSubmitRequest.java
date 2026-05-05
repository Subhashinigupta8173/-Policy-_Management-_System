package com.insurex.policy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ClaimSubmitRequest {
    @NotNull
    private Long policyId;

    @NotNull
    private LocalDate incidentDate;

    @NotBlank
    private String description;
}
