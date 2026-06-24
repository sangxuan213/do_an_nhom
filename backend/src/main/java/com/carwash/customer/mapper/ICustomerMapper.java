package com.carwash.customer.mapper;

import com.carwash.customer.dto.request.CustomerRequest;
import com.carwash.customer.dto.response.CustomerResponse;
import com.carwash.dto.response.WashHistoryResponse;
import com.carwash.entity.Booking;
import com.carwash.customer.entity.Customer;

public interface ICustomerMapper {
    
    CustomerResponse toResponse(Customer customer);

    Customer toEntity(CustomerRequest request);

    WashHistoryResponse toWashHistoryResponse(Booking booking);
}
