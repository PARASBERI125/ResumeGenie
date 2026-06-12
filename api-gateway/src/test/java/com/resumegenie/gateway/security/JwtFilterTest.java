package com.resumegenie.gateway.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.atomic.AtomicReference;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class JwtFilterTest {
    private static final String SECRET = "change-this-development-secret-change-this";

    @Test
    void publicAuthRequestBypassesJwtValidation() throws Exception {
        JwtFilter filter = new JwtFilter(SECRET);
        FilterChain chain = org.mockito.Mockito.mock(FilterChain.class);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void protectedRequestWithoutBearerTokenReturnsUnauthorized() throws Exception {
        JwtFilter filter = new JwtFilter(SECRET);
        FilterChain chain = org.mockito.Mockito.mock(FilterChain.class);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/resumes");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(ServletRequest.class), any(ServletResponse.class));
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).isEqualTo("Invalid or expired token");
    }

    @Test
    void validTokenAddsUserHeadersBeforeForwarding() throws Exception {
        JwtFilter filter = new JwtFilter(SECRET);
        FilterChain chain = org.mockito.Mockito.mock(FilterChain.class);
        AtomicReference<ServletRequest> forwardedRequest = new AtomicReference<>();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/resumes");
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addHeader("Authorization", "Bearer " + jwtToken("alex@example.com", 42L, "USER"));

        org.mockito.Mockito.doAnswer(invocation -> {
            forwardedRequest.set(invocation.getArgument(0));
            return null;
        }).when(chain).doFilter(any(ServletRequest.class), any(ServletResponse.class));

        filter.doFilter(request, response, chain);

        HttpServletRequest wrappedRequest = (HttpServletRequest) forwardedRequest.get();
        assertThat(wrappedRequest.getHeader("X-User-Id")).isEqualTo("42");
        assertThat(wrappedRequest.getHeader("X-User-Role")).isEqualTo("USER");
        assertThat(wrappedRequest.getHeader("X-User-Email")).isEqualTo("alex@example.com");
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void nonAdminTokenCannotAccessAdminRoute() throws Exception {
        JwtFilter filter = new JwtFilter(SECRET);
        FilterChain chain = org.mockito.Mockito.mock(FilterChain.class);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/users");
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.addHeader("Authorization", "Bearer " + jwtToken("alex@example.com", 42L, "USER"));

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(ServletRequest.class), any(ServletResponse.class));
        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).isEqualTo("Admin access required");
    }

    private static String jwtToken(String subject, Long userId, String role) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(subject)
                .claim("userId", userId)
                .claim("role", role)
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();
    }
}
