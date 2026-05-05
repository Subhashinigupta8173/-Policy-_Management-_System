package com.insurex.policy.dto.request;

import com.insurex.policy.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotNull
    private Role role;

    private String phone;
}
