package com.carwash.repository;

import com.carwash.entity.TierRule;
import com.carwash.enums.TierName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TierRuleRepository extends JpaRepository<TierRule, Long> {
    Optional<TierRule> findByTargetTier(TierName targetTier);
}
