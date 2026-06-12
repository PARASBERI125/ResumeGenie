package com.resumegenie.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.resumegenie.auth.model.AppUser;
import com.resumegenie.auth.repository.UserRepository;
import com.resumegenie.common.auth.AuthResponse;
import com.resumegenie.common.auth.LoginRequest;
import com.resumegenie.common.auth.RegisterRequest;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerCreatesUserWithEncodedPasswordAndLowercaseEmail() {
        RegisterRequest request = new RegisterRequest("Alex Doe", "Alex@Example.com", "password123");
        when(userRepository.existsByEmail("Alex@Example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.createToken(any(AppUser.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(userCaptor.capture());
        AppUser savedUser = userCaptor.getValue();

        assertThat(savedUser.getFullName()).isEqualTo("Alex Doe");
        assertThat(savedUser.getEmail()).isEqualTo("alex@example.com");
        assertThat(savedUser.getPasswordHash()).isEqualTo("encoded-password");
        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.email()).isEqualTo("alex@example.com");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Alex Doe", "alex@example.com", "password123");
        when(userRepository.existsByEmail("alex@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email is already registered");
    }

    @Test
    void loginReturnsTokenForValidCredentials() {
        LoginRequest request = new LoginRequest("ALEX@example.com", "password123");
        AppUser user = new AppUser();
        user.setEmail("alex@example.com");
        user.setFullName("Alex Doe");
        user.setPasswordHash("encoded-password");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded-password")).thenReturn(true);
        when(jwtService.createToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("alex@example.com");
    }

    @Test
    void loginRejectsInvalidPassword() {
        LoginRequest request = new LoginRequest("alex@example.com", "wrong-password");
        AppUser user = new AppUser();
        user.setEmail("alex@example.com");
        user.setPasswordHash("encoded-password");

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid email or password");
    }
}
