package com.carwash.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileRequest {

    @NotBlank(message = "Ho ten khong duoc de trong")
    @Size(min = 2, max = 100, message = "Ho ten phai tu 2 den 100 ky tu")
    private String fullName;

    @NotBlank(message = "So dien thoai khong duoc de trong")
    @Size(max = 20, message = "So dien thoai khong duoc vuot qua 20 ky tu")
    private String phone;

    @NotBlank(message = "Bien so xe khong duoc de trong")
    @Size(max = 20, message = "Bien so xe khong duoc vuot qua 20 ky tu")
    private String licensePlate;
}
