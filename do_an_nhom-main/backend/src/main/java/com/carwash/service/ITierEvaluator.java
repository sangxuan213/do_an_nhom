package com.carwash.service;

import com.carwash.entity.LoyaltyAccount;
import com.carwash.enums.TierName;

public interface ITierEvaluator {
    TierName evaluate(LoyaltyAccount account);
}
