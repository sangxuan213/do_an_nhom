package com.carwash.entity;

import com.carwash.enums.TierName;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tier_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "min_spend", precision = 12, scale = 2, nullable = false)
    private BigDecimal minSpend;

    @Column(name = "min_visits", nullable = false)
    private Integer minVisits;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_tier", unique = true, nullable = false, length = 20)
    private TierName targetTier;
}
