package com.carwash.controller;

import com.carwash.dto.request.TierRuleRequest;
import com.carwash.entity.LoyaltyAccount;
import com.carwash.entity.Tier;
import com.carwash.entity.TierRule;
import com.carwash.enums.TierName;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.TierRepository;
import com.carwash.repository.TierRuleRepository;
import com.carwash.service.TierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tiers")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class TierConfigController {

    private final TierRuleRepository ruleRepository;
    private final TierRepository tierRepository;
    private final TierService tierService;

    // === Tier Rule Management ===

    @GetMapping("/rules")
    public ResponseEntity<List<TierRule>> getAllRules() {
        return ResponseEntity.ok(ruleRepository.findAll());
    }

    @PostMapping("/rules")
    public ResponseEntity<TierRule> createRule(@Valid @RequestBody TierRuleRequest request) {
        TierRule rule = ruleRepository.findByTargetTier(request.getTargetTier())
                .orElse(new TierRule());

        rule.setMinSpend(request.getMinSpend());
        rule.setMinVisits(request.getMinVisits());
        rule.setTargetTier(request.getTargetTier());

        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<TierRule> updateRule(@PathVariable Long id, @Valid @RequestBody TierRuleRequest request) {
        TierRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TierRule", "id", id));

        rule.setMinSpend(request.getMinSpend());
        rule.setMinVisits(request.getMinVisits());
        rule.setTargetTier(request.getTargetTier());

        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    // === Direct Tier Assignment ===

    @PostMapping("/customer/{customerId}/assign")
    public ResponseEntity<LoyaltyAccount> assignTier(@PathVariable Long customerId, @RequestParam TierName tier) {
        LoyaltyAccount account = tierService.assignTier(customerId, tier);
        return ResponseEntity.ok(account);
    }

    // === Tier & Perks Management ===

    @GetMapping("/config")
    public ResponseEntity<List<Tier>> getAllTiers() {
        return ResponseEntity.ok(tierRepository.findAll());
    }

    @PostMapping("/config")
    public ResponseEntity<Tier> configureTier(@RequestBody Tier tierRequest) {
        Tier tier = tierRepository.findByName(tierRequest.getName())
                .orElseGet(() -> Tier.builder()
                        .name(tierRequest.getName())
                        .build());
        
        tier.setPerks(tierRequest.getPerks());
        return ResponseEntity.ok(tierRepository.save(tier));
    }

    // === Trigger Monthly Review Manually ===

    @PostMapping("/run-monthly-review")
    public ResponseEntity<String> triggerMonthlyReview() {
        tierService.runMonthlyReview();
        return ResponseEntity.ok("Monthly tier review process triggered successfully.");
    }
}
