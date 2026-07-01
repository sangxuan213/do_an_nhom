package com.carwash.service;

import com.carwash.entity.LoyaltyAccount;
import com.carwash.entity.TierRule;
import com.carwash.enums.TierName;
import com.carwash.repository.LoyaltyAccountRepository;
import com.carwash.repository.TierRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MonthlyTierEvaluator implements ITierEvaluator {

    private final TierRuleRepository ruleRepository;
    private final LoyaltyAccountRepository accountRepository;

    @Autowired(required = false)
    private IAdminNotifier adminNotifier;

    @Override
    public TierName evaluate(LoyaltyAccount account) {
        List<TierRule> rules = ruleRepository.findAll();
        
        TierName highestEligibleTier = TierName.BRONZE; // default base tier
        
        for (TierRule rule : rules) {
            boolean spendOk = account.getTotalSpend().compareTo(rule.getMinSpend()) >= 0;
            boolean visitsOk = account.getTotalVisits() >= rule.getMinVisits();
            
            if (spendOk && visitsOk) {
                if (rule.getTargetTier().ordinal() > highestEligibleTier.ordinal()) {
                    highestEligibleTier = rule.getTargetTier();
                }
            }
        }
        
        return highestEligibleTier;
    }

    @Transactional
    public void upgradeOrDowngrade(LoyaltyAccount account) {
        TierName newTier = evaluate(account);
        TierName oldTier = account.getCurrentTier();
        
        if (newTier != oldTier) {
            account.setCurrentTier(newTier);
            accountRepository.save(account);
            
            if (adminNotifier != null) {
                adminNotifier.notifyTierChange(account.getCustomerId(), oldTier, newTier);
            }
        }
    }
}
