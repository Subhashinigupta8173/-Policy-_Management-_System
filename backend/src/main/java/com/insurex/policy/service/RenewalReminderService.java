package com.insurex.policy.service;

import com.insurex.policy.entity.Policy;
import com.insurex.policy.entity.RenewalReminder;
import com.insurex.policy.repository.PolicyRepository;
import com.insurex.policy.repository.RenewalReminderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RenewalReminderService {

    private final PolicyRepository policyRepository;
    private final RenewalReminderRepository reminderRepository;

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendRenewalReminders() {
        LocalDate today = LocalDate.now();
        LocalDate target = today.plusDays(30);

        List<Policy> expiring = policyRepository.findExpiringBetween(target, target);
        log.info("[RenewalScheduler] Checking renewals for {}: {} policies found", target, expiring.size());

        for (Policy policy : expiring) {
            boolean alreadyCreated = reminderRepository
                    .existsByPolicyIdAndScheduledDate(policy.getId(), today);
            if (alreadyCreated) {
                log.debug("[RenewalScheduler] Reminder already exists for policy={}", policy.getPolicyNumber());
                continue;
            }

            log.info("[RenewalScheduler] Creating renewal reminder: policy={} holder={} expiry={}",
                    policy.getPolicyNumber(), policy.getUser().getName(), policy.getEndDate());

            RenewalReminder reminder = RenewalReminder.builder()
                    .policy(policy)
                    .scheduledDate(today)
                    .sentAt(null)
                    .build();
            reminderRepository.save(reminder);

            // To enable email: inject JavaMailSender and send notification here
            log.info("[RenewalScheduler] REMINDER: Policy {} for {} expires on {}. Renew to stay covered.",
                    policy.getPolicyNumber(), policy.getUser().getEmail(), policy.getEndDate());
        }
    }
}
