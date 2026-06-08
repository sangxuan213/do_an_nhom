package com.carwash.service;

import com.carwash.dto.request.CustomerProfileRequest;
import com.carwash.dto.response.CustomerProfileResponse;
import com.carwash.entity.Customer;
import com.carwash.entity.User;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.mapper.CustomerMapper;
import com.carwash.repository.CustomerRepository;
import com.carwash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final CustomerMapper customerMapper;

    public CustomerProfileResponse getCustomerProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return customerRepository.findByUserEmail(email)
                .map(customer -> customerMapper.toProfileResponse(customer, user))
                .orElseGet(() -> customerMapper.toProfileResponseFromUser(user));
    }

    @Transactional
    public CustomerProfileResponse updateCustomerProfile(String email, CustomerProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Sync details to User
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        // Find or create Customer profile
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseGet(() -> Customer.builder()
                        .user(user)
                        .build());

        customer.setName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setLicensePlate(request.getLicensePlate());
        
        Customer savedCustomer = customerRepository.save(customer);

        return customerMapper.toProfileResponse(savedCustomer, user);
    }
}
