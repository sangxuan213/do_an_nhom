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
    /**
     * Retrieves a customer profile by email, creating one when needed.
     *
     * @param email the user's email address
     * @return the customer's profile response
     */
    @Transactional
    public CustomerResponse getCustomerProfile(String email) {
        Customer customer = getOrCreateCustomer(email);
        return customerMapper.toResponse(customer);
    }
    /**
     * Updates a customer's profile and returns the saved profile data.
     *
     * @param email   the email address used to identify the customer
     * @param request the profile data to apply
     * @return the updated customer profile
     */
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
    /**
     * Finds a customer by the associated user's email or creates one from the user profile.
     *
     * @param email the user's email address
     * @return the existing or newly created customer
     * @throws ResourceNotFoundException if no user exists for the given email
     */
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
