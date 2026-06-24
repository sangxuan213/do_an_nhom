package com.carwash.customer.dto.response;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerResponse {
    private Long id;
    private Long accountId;
    private String name;
    private String phone;
    private String licensePlate;
    private Integer point;
    private LocalDateTime createdAt;
}
