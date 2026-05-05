package com.insurex.policy.repository;

import com.insurex.policy.entity.RenewalReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface RenewalReminderRepository extends JpaRepository<RenewalReminder, Long> {
    boolean existsByPolicyIdAndScheduledDate(Long policyId, LocalDate scheduledDate);
}
