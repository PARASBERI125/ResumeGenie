package com.resumegenie.common.auth;

public record AuthResponse(String token, String tokenType, Long userId, String email) {
}
