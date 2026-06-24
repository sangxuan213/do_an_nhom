package com.carwash.customer.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRequest {
    private Long accountId;
    private String name;
    private String phone;
    private String licensePlate;
}
