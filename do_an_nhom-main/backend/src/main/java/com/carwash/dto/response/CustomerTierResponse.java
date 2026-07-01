package com.carwash.dto.response;

import com.carwash.enums.TierName;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerTierResponse {
    private Long customerId;
    private TierName tierName;
    private List<String> perks;
}
