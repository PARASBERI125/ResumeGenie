package com.resumegenie.resume.service;

import com.resumegenie.common.ai.AiRewriteRequest;
import com.resumegenie.common.ai.AiRewriteResponse;
import com.resumegenie.common.resume.ResumeRequest;
import com.resumegenie.common.resume.ResumeResponse;
import com.resumegenie.resume.client.AiGenieClient;
import com.resumegenie.resume.model.ResumeDocument;
import com.resumegenie.resume.repository.ResumeRepository;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

@Service
public class ResumeService {
    private final ResumeRepository resumeRepository;
    private final AiGenieClient aiGenieClient;

    public ResumeService(ResumeRepository resumeRepository, AiGenieClient aiGenieClient) {
        this.resumeRepository = resumeRepository;
        this.aiGenieClient = aiGenieClient;
    }

    public ResumeResponse create(ResumeRequest request) {
        ResumeDocument document = new ResumeDocument();
        copy(request, document);
        return toResponse(resumeRepository.save(document));
    }

    public ResumeResponse get(String id) {
        return resumeRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NoSuchElementException("Resume not found"));
    }

    public List<ResumeResponse> listByUser(Long userId) {
        return resumeRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ResumeResponse update(String id, ResumeRequest request) {
        ResumeDocument document = resumeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Resume not found"));
        copy(request, document);
        document.touch();
        return toResponse(resumeRepository.save(document));
    }

    public void delete(String id) {
        resumeRepository.deleteById(id);
    }

    public AiRewriteResponse rewriteSection(String id, AiRewriteRequest request) {
        if (!resumeRepository.existsById(id)) {
            throw new NoSuchElementException("Resume not found");
        }
        return aiGenieClient.rewrite(request);
    }

    private void copy(ResumeRequest request, ResumeDocument document) {
        document.setUserId(request.userId());
        document.setTitle(request.title());
        document.setTargetRole(request.targetRole());
        document.setPersonalDetails(request.personalDetails());
        document.setEducation(request.education());
        document.setExperience(request.experience());
        document.setProjects(request.projects());
        document.setSkills(request.skills());
        document.setAchievements(request.achievements());
    }

    private ResumeResponse toResponse(ResumeDocument document) {
        return new ResumeResponse(
                document.getId(),
                document.getUserId(),
                document.getTitle(),
                document.getTargetRole(),
                document.getPersonalDetails(),
                document.getEducation(),
                document.getExperience(),
                document.getProjects(),
                document.getSkills(),
                document.getAchievements(),
                document.getCreatedAt(),
                document.getUpdatedAt());
    }
}
