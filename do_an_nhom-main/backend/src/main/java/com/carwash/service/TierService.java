package com.carwash.service;

import com.carwash.entity.LoyaltyAccount;
import com.carwash.enums.TierName;
import com.carwash.repository.LoyaltyAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TierService {

    private final LoyaltyAccountRepository accountRepository;
    private final MonthlyTierEvaluator tierEvaluator;
    private final IAdminNotifier adminNotifier;

    @Transactional
    public LoyaltyAccount assignTier(Long customerId, TierName tier) {
        log.info("Assigning tier {} to customer ID {}", tier, customerId);
        LoyaltyAccount account = accountRepository.findByCustomerId(customerId)
                .orElseGet(() -> LoyaltyAccount.builder()
                        .customerId(customerId)
                        .totalSpend(BigDecimal.ZERO)
                        .totalVisits(0)
                        .currentTier(TierName.BRONZE)
                        .build());

        TierName oldTier = account.getCurrentTier();
        if (oldTier != tier) {
            account.setCurrentTier(tier);
            account = accountRepository.save(account);
            if (adminNotifier != null) {
                adminNotifier.notifyTierChange(customerId, oldTier, tier);
            }
        }
        return account;
    }

    @Transactional
    public void runMonthlyReview() {
        log.info("Starting monthly tier review process for all customer loyalty accounts...");
        List<LoyaltyAccount> accounts = accountRepository.findAll();
        for (LoyaltyAccount account : accounts) {
            try {
                tierEvaluator.upgradeOrDowngrade(account);
            } catch (Exception e) {
                log.error("Error evaluating tier for customer ID: " + account.getCustomerId(), e);
            }
        }
        log.info("Monthly tier review process completed.");
    }

    @Scheduled(cron = "0 0 0 1 * ?")
    public void scheduledMonthlyReview() {
        log.info("Scheduled job triggered: Monthly tier review.");
        runMonthlyReview();
    }
}
