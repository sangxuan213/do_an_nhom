package com.carwash.controller;

import com.carwash.dto.response.CustomerTierResponse;
import com.carwash.entity.LoyaltyAccount;
import com.carwash.entity.Tier;
import com.carwash.enums.TierName;
import com.carwash.repository.LoyaltyAccountRepository;
import com.carwash.repository.TierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/tiers")
@RequiredArgsConstructor
public class TierController {

    private final LoyaltyAccountRepository accountRepository;
    private final TierRepository tierRepository;

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomerTierResponse> getCustomerTier(@PathVariable Long customerId) {
        LoyaltyAccount account = accountRepository.findByCustomerId(customerId)
                .orElseGet(() -> LoyaltyAccount.builder()
                        .customerId(customerId)
                        .currentTier(TierName.BRONZE)
                        .build());

        TierName tierName = account.getCurrentTier();
        List<String> perks = tierRepository.findByName(tierName)
                .map(Tier::getPerks)
                .orElse(Collections.emptyList());

        CustomerTierResponse response = CustomerTierResponse.builder()
                .customerId(customerId)
                .tierName(tierName)
                .perks(perks)
                .build();

        return ResponseEntity.ok(response);
    }
}
