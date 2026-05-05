package com.insurex.policy.repository;

import com.insurex.policy.entity.InsuranceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsuranceProductRepository extends JpaRepository<InsuranceProduct, Long> {
    List<InsuranceProduct> findAllByActiveTrue();
}
