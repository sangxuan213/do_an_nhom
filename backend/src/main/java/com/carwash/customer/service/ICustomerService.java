package com.carwash.customer.service;

import com.carwash.customer.entity.Customer;
import java.util.*;

public interface ICustomerService {

    List<Customer> getAllCustomers();

    Customer getCustomerById(Long id);

    Customer createCustomer(Customer customer);

    Customer updateCustomer(Long id, Customer customer);

    void deleteCustomer(Long id);

}