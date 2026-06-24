package com.carwash.customer.service;

import com.carwash.customer.dto.request.CustomerRequest;
import com.carwash.customer.dto.response.CustomerResponse;

public interface ICustomerService {
    
    CustomerResponse getCustomerProfile(String email);

    CustomerResponse updateCustomerProfile(String email, CustomerRequest request);
}