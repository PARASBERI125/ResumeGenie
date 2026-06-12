package com.resumegenie.common.ai;

import jakarta.validation.constraints.NotBlank;

public record AiBuildResumeRequest(
        @NotBlank String targetRole,
        String basicDetails,
        String educationNotes,
        String experienceNotes,
        String projectNotes,
        String skillsNotes,
        String achievementsNotes
) {
}
