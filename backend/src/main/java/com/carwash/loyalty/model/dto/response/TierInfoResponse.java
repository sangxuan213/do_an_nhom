package com.carwash.loyalty.model.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TierInfoResponse {
    private String name;
    private Integer minPoints;
    private List<String> benefits;
}