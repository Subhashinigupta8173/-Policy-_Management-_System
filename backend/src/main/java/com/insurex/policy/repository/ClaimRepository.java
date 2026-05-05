package com.insurex.policy.repository;

import com.insurex.policy.entity.Claim;
import com.insurex.policy.enums.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByUserId(Long userId);
    long countByStatus(ClaimStatus status);
}
