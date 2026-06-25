package com.carwash.mapper;
import com.carwash.dto.request.CustomerRequest;
import com.carwash.dto.response.CustomerResponse;
import com.carwash.entity.Customer;
import org.springframework.stereotype.Component;
// Mapper cho Customer và CustomerDTO
@Component
public class CustomerMapper {
    /**
     * Converts a Customer entity to a CustomerResponse.
     *
     * @param customer the customer to convert
     * @return the mapped customer response, or {@code null} if the customer is {@code null}
     */
    public CustomerResponse toResponse(Customer customer) {
        if (customer == null) {
            return null;
        }
        return CustomerResponse.builder()
                .id(customer.getId())
                .userId(customer.getUser() != null ? customer.getUser().getId() : null)
                .name(customer.getName())
                .email(customer.getUser() != null ? customer.getUser().getEmail() : null)
                .phone(customer.getPhone())
                .licensePlate(customer.getLicensePlate())
                .build();
    }
    /**
     * Converts a customer request into a customer entity.
     *
     * @param request the source request
     * @return the created customer entity, or {@code null} if the request is {@code null}
     */
    public Customer toEntity(CustomerRequest request) {
        if (request == null) {
            return null;
        }
        return Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .licensePlate(request.getLicensePlate())
                .build();
    }
    /**
     * Updates a customer with values from a customer request.
     *
     * @param request the source values to apply
     * @param customer the customer to update
     */
    public void updateEntity(CustomerRequest request, Customer customer) {
        if (request == null || customer == null) {
            return;
        }
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setLicensePlate(request.getLicensePlate());
    }
}