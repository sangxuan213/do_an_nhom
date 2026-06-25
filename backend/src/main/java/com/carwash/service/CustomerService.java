package com.carwash.service;
import com.carwash.dto.request.CustomerRequest;
import com.carwash.dto.response.CustomerResponse;
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
    // lấy hồ sơ
    @Transactional
    public CustomerResponse getCustomerProfile(String email) {
        Customer customer = getOrCreateCustomer(email);
        return customerMapper.toResponse(customer);
    }
    // cập nhật hồ sơ
    @Transactional
    public CustomerResponse updateCustomerProfile(String email, CustomerRequest request) {
        Customer customer = getOrCreateCustomer(email);
        customerMapper.updateEntity(request, customer);
        User user = customer.getUser();
        if (user != null) {
            user.setFullName(request.getName());
            user.setPhone(request.getPhone());
            userRepository.save(user);
        }
        customer = customerRepository.save(customer);
        return customerMapper.toResponse(customer);
    }
    // tìm hoặc tự tạo mới hồ sơ
    private Customer getOrCreateCustomer(String email) {
        return customerRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
                    Customer newCustomer = Customer.builder()
                            .name(user.getFullName())
                            .phone(user.getPhone() != null ? user.getPhone() : "")
                            .user(user)
                            .build();
                    return customerRepository.save(newCustomer);
                });
    }
}
