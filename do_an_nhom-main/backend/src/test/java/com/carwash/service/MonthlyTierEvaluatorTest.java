package com.carwash.service;

import com.carwash.entity.LoyaltyAccount;
import com.carwash.entity.TierRule;
import com.carwash.enums.TierName;
import com.carwash.repository.LoyaltyAccountRepository;
import com.carwash.repository.TierRuleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MonthlyTierEvaluatorTest {

    @Mock
    private TierRuleRepository ruleRepository;

    @Mock
    private LoyaltyAccountRepository accountRepository;

    @Mock
    private IAdminNotifier adminNotifier;

    @InjectMocks
    private MonthlyTierEvaluator tierEvaluator;

    private List<TierRule> mockRules;

    @BeforeEach
    void setUp() {
        TierRule silverRule = TierRule.builder()
                .id(1L)
                .minSpend(new BigDecimal("100.00"))
                .minVisits(2)
                .targetTier(TierName.SILVER)
                .build();

        TierRule goldRule = TierRule.builder()
                .id(2L)
                .minSpend(new BigDecimal("300.00"))
                .minVisits(5)
                .targetTier(TierName.GOLD)
                .build();

        TierRule diamondRule = TierRule.builder()
                .id(3L)
                .minSpend(new BigDecimal("1000.00"))
                .minVisits(10)
                .targetTier(TierName.DIAMOND)
                .build();

        mockRules = Arrays.asList(silverRule, goldRule, diamondRule);
        
        lenient().when(ruleRepository.findAll()).thenReturn(mockRules);
    }

    @Test
    void testEvaluate_UpgradeToGold_Success() {
        LoyaltyAccount account = LoyaltyAccount.builder()
                .customerId(101L)
                .totalSpend(new BigDecimal("350.00"))
                .totalVisits(6)
                .currentTier(TierName.BRONZE)
                .build();

        TierName evaluatedTier = tierEvaluator.evaluate(account);
        assertEquals(TierName.GOLD, evaluatedTier);
    }

    @Test
    void testEvaluate_DowngradeToBronze_Success() {
        LoyaltyAccount account = LoyaltyAccount.builder()
                .customerId(102L)
                .totalSpend(new BigDecimal("50.00"))
                .totalVisits(1)
                .currentTier(TierName.SILVER)
                .build();

        TierName evaluatedTier = tierEvaluator.evaluate(account);
        assertEquals(TierName.BRONZE, evaluatedTier);
    }

    @Test
    void testEvaluate_ExactBoundary_Success() {
        LoyaltyAccount account = LoyaltyAccount.builder()
                .customerId(103L)
                .totalSpend(new BigDecimal("300.00"))
                .totalVisits(5)
                .currentTier(TierName.SILVER)
                .build();

        TierName evaluatedTier = tierEvaluator.evaluate(account);
        assertEquals(TierName.GOLD, evaluatedTier);
    }

    @Test
    void testEvaluate_HighSpendLowVisits_RemainsBronze() {
        LoyaltyAccount account = LoyaltyAccount.builder()
                .customerId(104L)
                .totalSpend(new BigDecimal("1500.00"))
                .totalVisits(1)
                .currentTier(TierName.BRONZE)
                .build();

        TierName evaluatedTier = tierEvaluator.evaluate(account);
        assertEquals(TierName.BRONZE, evaluatedTier);
    }

    @Test
    void testUpgradeOrDowngrade_TriggerNotification() {
        LoyaltyAccount account = LoyaltyAccount.builder()
                .customerId(105L)
                .totalSpend(new BigDecimal("300.00"))
                .totalVisits(5)
                .currentTier(TierName.BRONZE)
                .build();

        tierEvaluator.upgradeOrDowngrade(account);

        assertEquals(TierName.GOLD, account.getCurrentTier());

        verify(accountRepository, times(1)).save(account);

        verify(adminNotifier, times(1)).notifyTierChange(105L, TierName.BRONZE, TierName.GOLD);
    }

    @Test
    void testUpgradeOrDowngrade_NoChange_NoNotification() {
        LoyaltyAccount account = LoyaltyAccount.builder()
                .customerId(106L)
                .totalSpend(new BigDecimal("300.00"))
                .totalVisits(5)
                .currentTier(TierName.GOLD)
                .build();

        tierEvaluator.upgradeOrDowngrade(account);

        assertEquals(TierName.GOLD, account.getCurrentTier());

        verify(accountRepository, never()).save(any());
        verify(adminNotifier, never()).notifyTierChange(anyLong(), any(), any());
    }
}
