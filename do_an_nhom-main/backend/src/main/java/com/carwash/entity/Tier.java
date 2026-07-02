package com.carwash.entity;

import com.carwash.enums.TierName;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tier {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "tier_id")
    private UUID tierId;

    @Enumerated(EnumType.STRING)
    @Column(name = "name", unique = true, nullable = false, length = 20)
    private TierName name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tier_perks", joinColumns = @JoinColumn(name = "tier_id"))
    @Column(name = "perk")
    @Builder.Default
    private List<String> perks = new ArrayList<>();
}
