package com.carwash.service;

import com.carwash.enums.LoyaltyTier;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class TierBookingWindowPolicy {

    // kiem tra xem khach hang co duoc dat lich truoc so ngay nay khong
    public boolean canBookAdvance(LoyaltyTier tier, LocalDate bookingDate) {
        long daysInAdvance = ChronoUnit.DAYS.between(LocalDate.now(), bookingDate);
        
        int maxDaysAllowed = switch (tier) {
            case BRONZE -> 7; // giam so ngay xuong vi k co Member
            case SILVER -> 10;
            case GOLD -> 12;
            default -> 7;
        };

        return daysInAdvance <= maxDaysAllowed;
    }
}
