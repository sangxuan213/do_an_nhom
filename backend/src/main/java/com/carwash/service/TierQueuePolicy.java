package com.carwash.service;

import com.carwash.enums.LoyaltyTier;
import org.springframework.stereotype.Component;

@Component
public class TierQueuePolicy {

    // xac dinh do uu tien xep hang dua vao hang thanh vien
    public int calculateQueuePriority(LoyaltyTier tier) {
        return switch (tier) {
            case BRONZE -> 1;
            case SILVER -> 2;
            case GOLD -> 3;
            default -> 0;
        };
    }
}
