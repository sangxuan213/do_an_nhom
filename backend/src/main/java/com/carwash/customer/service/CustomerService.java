package com.carwash.customer.service;

import com.carwash.customer.dto.request.CustomerRequest;
import com.carwash.customer.dto.response.CustomerResponse;
import com.carwash.customer.entity.Customer;
import com.carwash.entity.User;
import com.carwash.repository.UserRepository;
import com.carwash.exception.ResourceNotFoundException;
import com.carwash.customer.mapper.ICustomerMapper;
import com.carwash.customer.repository.ICustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService implements ICustomerService {
    
    private final ICustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ICustomerMapper customerMapper;

    // Lấy thông tin profile bằng email của User đăng nhập
    @Override
    public CustomerResponse getCustomerProfile(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "email", email));
        return customerMapper.toResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomerProfile(String email, CustomerRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Cập nhật thông tin User liên kết
        user.setFullName(request.getName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        // Tìm hoặc tạo mới Customer
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseGet(() -> Customer.builder().user(user).build());
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setLicensePlate(request.getLicensePlate());
        
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toResponse(savedCustomer);
    }
}