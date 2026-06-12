package com.resumegenie.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;

@Component
public class JwtFilter extends GenericFilterBean {
    private final String secret;

    public JwtFilter(@Value("${security.jwt.secret}") String secret) {
        this.secret = secret;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        HttpServletResponse httpServletResponse = (HttpServletResponse) servletResponse;
        String requestPath = httpServletRequest.getRequestURI();

        if (isPublicRequest(requestPath)) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        String token = httpServletRequest.getHeader("Authorization");
        Claims claims = validateToken(token);

        if (token == null || !token.startsWith("Bearer ") || claims == null) {
            httpServletResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpServletResponse.getWriter().write("Invalid or expired token");
            return;
        }

        String role = String.valueOf(claims.getOrDefault("role", "USER"));
        if (requestPath.startsWith("/api/admin") && !"ADMIN".equalsIgnoreCase(role)) {
            httpServletResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
            httpServletResponse.getWriter().write("Admin access required");
            return;
        }

        httpServletRequest.setAttribute("role", role);

        MutableHeaderRequest wrappedRequest = new MutableHeaderRequest(httpServletRequest);
        wrappedRequest.putHeader("X-User-Id", String.valueOf(claims.get("userId")));
        wrappedRequest.putHeader("X-User-Role", role);
        wrappedRequest.putHeader("X-User-Email", claims.getSubject());

        filterChain.doFilter(wrappedRequest, servletResponse);
    }

    private boolean isPublicRequest(String requestPath) {
        return requestPath.startsWith("/api/auth/login")
                || requestPath.startsWith("/api/auth/register")
                || requestPath.startsWith("/api/user/login")
                || requestPath.startsWith("/api/user/register");
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private Claims validateToken(String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return null;
            }
            String jwtToken = token.substring(7);
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(jwtToken)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    private static class MutableHeaderRequest extends HttpServletRequestWrapper {
        private final Map<String, String> customHeaders = new HashMap<>();

        private MutableHeaderRequest(HttpServletRequest request) {
            super(request);
        }

        private void putHeader(String name, String value) {
            customHeaders.put(name, value);
        }

        @Override
        public String getHeader(String name) {
            String value = customHeaders.get(name);
            return value != null ? value : super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            Map<String, String> headers = new HashMap<>();
            Enumeration<String> names = super.getHeaderNames();

            while (names.hasMoreElements()) {
                String name = names.nextElement();
                headers.put(name, super.getHeader(name));
            }

            headers.putAll(customHeaders);
            return Collections.enumeration(headers.keySet());
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            String value = customHeaders.get(name);
            if (value != null) {
                return Collections.enumeration(Collections.singletonList(value));
            }
            return super.getHeaders(name);
        }
    }
}
