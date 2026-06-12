package com.resumegenie.common.resume;

import java.time.Instant;
import java.util.List;

public record ResumeResponse(
        String id,
        Long userId,
        String title,
        String targetRole,
        ResumeRequest.PersonalDetails personalDetails,
        List<ResumeRequest.Education> education,
        List<ResumeRequest.Experience> experience,
        List<ResumeRequest.Project> projects,
        List<String> skills,
        List<String> achievements,
        Instant createdAt,
        Instant updatedAt
) {
}
