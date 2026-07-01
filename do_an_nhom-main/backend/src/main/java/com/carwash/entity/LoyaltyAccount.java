package com.carwash.entity;

import com.carwash.enums.TierName;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "loyalty_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", unique = true, nullable = false)
    private Long customerId;

    @Column(name = "total_spend", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalSpend;

    @Column(name = "total_visits", nullable = false)
    private Integer totalVisits;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_tier", nullable = false, length = 20)
    private TierName currentTier;
}
