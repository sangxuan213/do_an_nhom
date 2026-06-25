package com.carwash.repository;
import com.carwash.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    /**
 * Finds a customer by user ID.
 *
 * @param userId the user ID to match
 * @return the customer with the specified user ID
 */
Optional<Customer> findByUserId(Long userId);
    /**
 * Finds a customer by email address.
 *
 * @param  email the customer email address
 * @return       the matching customer, if present
 */
Optional<Customer> findByUserEmail(String email);
}