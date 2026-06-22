package com.carwash.customer.repository;

import com.carwash.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByAccountId(Long accountId);
    Optional<Customer> findByPhone(String phone);
}