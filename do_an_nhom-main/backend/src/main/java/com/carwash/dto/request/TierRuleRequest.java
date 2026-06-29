package com.carwash.dto.request;

import com.carwash.enums.TierName;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierRuleRequest {

    @NotNull(message = "Minimum spend is required")
    @DecimalMin(value = "0.0", message = "Minimum spend must be at least 0.0")
    private BigDecimal minSpend;

    @NotNull(message = "Minimum visits is required")
    @Min(value = 0, message = "Minimum visits must be at least 0")
    private Integer minVisits;

    @NotNull(message = "Target tier name is required")
    private TierName targetTier;
}
