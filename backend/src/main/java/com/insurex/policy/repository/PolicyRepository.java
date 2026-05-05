package com.insurex.policy.repository;

import com.insurex.policy.entity.Policy;
import com.insurex.policy.enums.PolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByUserId(Long userId);
    long countByStatus(PolicyStatus status);

    @Query("SELECT p FROM Policy p WHERE p.status = 'ACTIVE' AND p.endDate BETWEEN :from AND :to")
    List<Policy> findExpiringBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT SUM(p.premiumAmount) FROM Policy p WHERE p.status = 'ACTIVE'")
    java.math.BigDecimal sumActivePremiums();
}
