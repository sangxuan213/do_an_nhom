package com.carwash.service;

import com.carwash.enums.TierName;

public interface IAdminNotifier {
    void notifyTierChange(Long customerId, TierName oldTier, TierName newTier);
}
