package com.insurex.policy.service;

import com.insurex.policy.dto.request.ClaimStatusUpdateRequest;
import com.insurex.policy.dto.request.ClaimSubmitRequest;
import com.insurex.policy.dto.response.ClaimResponse;
import com.insurex.policy.entity.Claim;
import com.insurex.policy.entity.Policy;
import com.insurex.policy.entity.User;
import com.insurex.policy.enums.ClaimEvent;
import com.insurex.policy.enums.ClaimStatus;
import com.insurex.policy.enums.PolicyStatus;
import com.insurex.policy.exception.AppException;
import com.insurex.policy.exception.InvalidStateTransitionException;
import com.insurex.policy.exception.ResourceNotFoundException;
import com.insurex.policy.repository.ClaimRepository;
import com.insurex.policy.repository.PolicyRepository;
import com.insurex.policy.repository.UserRepository;
import com.insurex.policy.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final StateMachineFactory<ClaimStatus, ClaimEvent> stateMachineFactory;

    @Transactional
    public ClaimResponse submit(ClaimSubmitRequest req, MultipartFile proofDoc, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Policy policy = policyRepository.findById(req.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found: " + req.getPolicyId()));

        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Only ACTIVE policies can have claims");
        }
        if (!policy.getUser().getId().equals(user.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "You are not the policy holder");
        }

        String proofPath = null;
        if (proofDoc != null && !proofDoc.isEmpty()) {
            proofPath = storageService.store(proofDoc, "claims/");
        }

        String claimNumber = "CLM-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        Claim claim = Claim.builder()
                .claimNumber(claimNumber)
                .policy(policy)
                .user(user)
                .status(ClaimStatus.SUBMITTED)
                .incidentDate(req.getIncidentDate())
                .description(req.getDescription())
                .proofDocPath(proofPath)
                .build();

        return toResponse(claimRepository.save(claim));
    }

    @Transactional
    public ClaimResponse updateStatus(Long claimId, ClaimStatusUpdateRequest req, String adjusterEmail) {
        User adjuster = userRepository.findByEmail(adjusterEmail).orElseThrow();
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + claimId));

        ClaimEvent event = mapToEvent(claim.getStatus(), req.getTargetStatus());

        StateMachine<ClaimStatus, ClaimEvent> sm = stateMachineFactory.getStateMachine();
        sm.startReactively().block();

        sm.getStateMachineAccessor().doWithAllRegions(accessor ->
                accessor.resetStateMachine(
                        new DefaultStateMachineContext<>(claim.getStatus(), null, null, null)));

        var results = sm.sendEvent(Mono.just(MessageBuilder.withPayload(event).build()));
        var result = results.blockLast();

        boolean accepted = result != null &&
                result.getResultType() == org.springframework.statemachine.StateMachineEventResult.ResultType.ACCEPTED;

        if (!accepted) {
            throw new InvalidStateTransitionException(
                    "Cannot transition claim from " + claim.getStatus() + " to " + req.getTargetStatus());
        }

        claim.setStatus(req.getTargetStatus());
        claim.setAdjuster(adjuster);
        if (req.getSettlementAmount() != null) {
            claim.setSettlementAmount(req.getSettlementAmount());
        }
        return toResponse(claimRepository.save(claim));
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getMyClaims(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return claimRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll().stream().map(this::toResponse).toList();
    }

    private ClaimEvent mapToEvent(ClaimStatus from, ClaimStatus to) {
        if (from == ClaimStatus.SUBMITTED   && to == ClaimStatus.UNDER_REVIEW) return ClaimEvent.START_REVIEW;
        if (from == ClaimStatus.UNDER_REVIEW && to == ClaimStatus.APPROVED)    return ClaimEvent.APPROVE;
        if (from == ClaimStatus.UNDER_REVIEW && to == ClaimStatus.REJECTED)    return ClaimEvent.REJECT;
        if (from == ClaimStatus.APPROVED     && to == ClaimStatus.DISBURSED)   return ClaimEvent.DISBURSE;
        throw new InvalidStateTransitionException(
                "No transition defined from " + from + " to " + to);
    }

    private ClaimResponse toResponse(Claim c) {
        return ClaimResponse.builder()
                .id(c.getId())
                .claimNumber(c.getClaimNumber())
                .policyId(c.getPolicy().getId())
                .policyNumber(c.getPolicy().getPolicyNumber())
                .userId(c.getUser().getId())
                .customerName(c.getUser().getName())
                .status(c.getStatus())
                .incidentDate(c.getIncidentDate())
                .description(c.getDescription())
                .proofDocPath(c.getProofDocPath())
                .adjusterName(c.getAdjuster() != null ? c.getAdjuster().getName() : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .settlementAmount(c.getSettlementAmount())
                .build();
    }
}
