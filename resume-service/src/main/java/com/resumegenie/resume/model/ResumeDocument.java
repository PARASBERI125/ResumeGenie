package com.resumegenie.resume.model;

import com.resumegenie.common.resume.ResumeRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resumes")
public class ResumeDocument {
    @Id
    private String id;
    private Long userId;
    private String title;
    private String targetRole;
    private ResumeRequest.PersonalDetails personalDetails;
    private List<ResumeRequest.Education> education = new ArrayList<>();
    private List<ResumeRequest.Experience> experience = new ArrayList<>();
    private List<ResumeRequest.Project> projects = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private List<String> achievements = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public String getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public ResumeRequest.PersonalDetails getPersonalDetails() {
        return personalDetails;
    }

    public void setPersonalDetails(ResumeRequest.PersonalDetails personalDetails) {
        this.personalDetails = personalDetails;
    }

    public List<ResumeRequest.Education> getEducation() {
        return education;
    }

    public void setEducation(List<ResumeRequest.Education> education) {
        this.education = education == null ? new ArrayList<>() : education;
    }

    public List<ResumeRequest.Experience> getExperience() {
        return experience;
    }

    public void setExperience(List<ResumeRequest.Experience> experience) {
        this.experience = experience == null ? new ArrayList<>() : experience;
    }

    public List<ResumeRequest.Project> getProjects() {
        return projects;
    }

    public void setProjects(List<ResumeRequest.Project> projects) {
        this.projects = projects == null ? new ArrayList<>() : projects;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills == null ? new ArrayList<>() : skills;
    }

    public List<String> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<String> achievements) {
        this.achievements = achievements == null ? new ArrayList<>() : achievements;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void touch() {
        this.updatedAt = Instant.now();
    }
}
