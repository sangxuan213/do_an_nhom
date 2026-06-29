package com.carwash.service;

import com.carwash.enums.TierName;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ConsoleAdminNotifier implements IAdminNotifier {
    @Override
    public void notifyTierChange(Long customerId, TierName oldTier, TierName newTier) {
        log.info("[SYSTEM NOTIFICATION] Customer ID {} changed tier from {} to {}", customerId, oldTier, newTier);
    }
}
