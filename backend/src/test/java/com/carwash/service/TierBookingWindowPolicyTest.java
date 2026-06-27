package com.carwash.service;

import com.carwash.enums.LoyaltyTier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class TierBookingWindowPolicyTest {

    private TierBookingWindowPolicy policy;

    @BeforeEach
    void setUp() {
        policy = new TierBookingWindowPolicy();
    }

    @Test
    void testBronzeTier_CanBookWithin7Days() {
        LocalDate today = LocalDate.now();
        
        // Hop le: 7 ngay
        assertTrue(policy.canBookAdvance(LoyaltyTier.BRONZE, today.plusDays(7)));
        // Hop le: 5 ngay
        assertTrue(policy.canBookAdvance(LoyaltyTier.BRONZE, today.plusDays(5)));
        
        // Khong hop le: 8 ngay
        assertFalse(policy.canBookAdvance(LoyaltyTier.BRONZE, today.plusDays(8)));
    }

    @Test
    void testSilverTier_CanBookWithin10Days() {
        LocalDate today = LocalDate.now();
        
        assertTrue(policy.canBookAdvance(LoyaltyTier.SILVER, today.plusDays(10)));
        assertFalse(policy.canBookAdvance(LoyaltyTier.SILVER, today.plusDays(11)));
    }

    @Test
    void testGoldTier_CanBookWithin12Days() {
        LocalDate today = LocalDate.now();
        
        assertTrue(policy.canBookAdvance(LoyaltyTier.GOLD, today.plusDays(12)));
        assertFalse(policy.canBookAdvance(LoyaltyTier.GOLD, today.plusDays(13)));
    }
}
