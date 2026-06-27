package com.carwash.loyalty.repository;

import com.carwash.loyalty.model.entity.LoyaltyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyConfigRepository extends JpaRepository<LoyaltyConfig, Long> {

    Optional<LoyaltyConfig> findByTier(String tier);
}