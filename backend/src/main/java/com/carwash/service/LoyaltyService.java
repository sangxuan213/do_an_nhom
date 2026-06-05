package com.carwash.service;

import com.carwash.dto.response.LoyaltyResponse;
import com.carwash.entity.User;
import com.carwash.enums.LoyaltyTier;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.repository.BookingRepository;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    // Tier thresholds
    private static final int SILVER_THRESHOLD = 500;
    private static final int GOLD_THRESHOLD = 1500;

    @Transactional
    public void awardPoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
        user.setLoyaltyTier(calculateTier(user.getLoyaltyPoints()));
        userRepository.save(user);
    }

    public LoyaltyResponse getLoyaltyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        long totalWashes = bookingRepository.countCompletedBookingsByUserId(user.getId());
        LoyaltyTier currentTier = user.getLoyaltyTier();
        LoyaltyTier nextTier = getNextTier(currentTier);
        int pointsToNext = calculatePointsToNextTier(user.getLoyaltyPoints(), currentTier);

        return LoyaltyResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .totalPoints(user.getLoyaltyPoints())
                .currentTier(currentTier)
                .nextTier(nextTier)
                .pointsToNextTier(pointsToNext)
                .totalWashes((int) totalWashes)
                .redeemablePoints(user.getLoyaltyPoints())
                .build();
    }

    @Transactional
    public LoyaltyResponse adminUpdatePoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setLoyaltyPoints(points);
        user.setLoyaltyTier(calculateTier(points));
        userRepository.save(user);

        long totalWashes = bookingRepository.countCompletedBookingsByUserId(userId);
        LoyaltyTier nextTier = getNextTier(user.getLoyaltyTier());

        return LoyaltyResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .totalPoints(user.getLoyaltyPoints())
                .currentTier(user.getLoyaltyTier())
                .nextTier(nextTier)
                .pointsToNextTier(calculatePointsToNextTier(user.getLoyaltyPoints(), user.getLoyaltyTier()))
                .totalWashes((int) totalWashes)
                .redeemablePoints(user.getLoyaltyPoints())
                .build();
    }

    private LoyaltyTier calculateTier(int points) {
        if (points >= GOLD_THRESHOLD) return LoyaltyTier.GOLD;
        if (points >= SILVER_THRESHOLD) return LoyaltyTier.SILVER;
        return LoyaltyTier.BRONZE;
    }

    private LoyaltyTier getNextTier(LoyaltyTier currentTier) {
        return switch (currentTier) {
            case BRONZE -> LoyaltyTier.SILVER;
            case SILVER -> LoyaltyTier.GOLD;
            case GOLD -> null; // Max tier
        };
    }

    private int calculatePointsToNextTier(int currentPoints, LoyaltyTier currentTier) {
        return switch (currentTier) {
            case BRONZE -> SILVER_THRESHOLD - currentPoints;
            case SILVER -> GOLD_THRESHOLD - currentPoints;
            case GOLD -> 0; // Already max
        };
    }
}
