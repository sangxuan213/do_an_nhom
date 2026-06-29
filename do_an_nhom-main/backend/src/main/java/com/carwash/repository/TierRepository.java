package com.carwash.repository;

import com.carwash.entity.Tier;
import com.carwash.enums.TierName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TierRepository extends JpaRepository<Tier, UUID> {
    Optional<Tier> findByName(TierName name);
}
