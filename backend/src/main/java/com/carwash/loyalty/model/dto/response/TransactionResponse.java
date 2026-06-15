package com.carwash.loyalty.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder  // ← PHẢI CÓ @Builder
public class TransactionResponse {
    private Long id;
    private Integer points;
    private String type;
    private String description;
    private LocalDateTime createdAt;
}