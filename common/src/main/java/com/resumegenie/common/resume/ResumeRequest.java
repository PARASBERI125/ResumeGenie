package com.resumegenie.common.resume;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ResumeRequest(
        @NotNull Long userId,
        @NotBlank String title,
        String targetRole,
        PersonalDetails personalDetails,
        List<Education> education,
        List<Experience> experience,
        List<Project> projects,
        List<String> skills,
        List<String> achievements
) {
    public record PersonalDetails(String fullName, String email, String phone, String location, String linkedIn, String github) {
    }

    public record Education(String institution, String degree, String field, String startDate, String endDate, String score) {
    }

    public record Experience(String company, String role, String startDate, String endDate, List<String> bullets) {
    }

    public record Project(String name, String description, List<String> technologies, List<String> bullets) {
    }
}
