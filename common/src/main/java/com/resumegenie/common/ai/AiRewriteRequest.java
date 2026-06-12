package com.resumegenie.common.ai;

import jakarta.validation.constraints.NotBlank;

public record AiRewriteRequest(
        @NotBlank String targetRole,
        @NotBlank String sectionType,
        @NotBlank String originalText
) {
}
