package com.resumegenie.resume.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.resumegenie.common.ai.AiRewriteRequest;
import com.resumegenie.common.ai.AiRewriteResponse;
import com.resumegenie.common.resume.ResumeRequest;
import com.resumegenie.common.resume.ResumeResponse;
import com.resumegenie.resume.client.AiGenieClient;
import com.resumegenie.resume.model.ResumeDocument;
import com.resumegenie.resume.repository.ResumeRepository;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {
    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private AiGenieClient aiGenieClient;

    @InjectMocks
    private ResumeService resumeService;

    @Test
    void createPersistsResumeRequest() {
        ResumeRequest request = sampleRequest();
        when(resumeRepository.save(any(ResumeDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResumeResponse response = resumeService.create(request);

        ArgumentCaptor<ResumeDocument> documentCaptor = ArgumentCaptor.forClass(ResumeDocument.class);
        verify(resumeRepository).save(documentCaptor.capture());
        ResumeDocument savedDocument = documentCaptor.getValue();

        assertThat(savedDocument.getUserId()).isEqualTo(42L);
        assertThat(savedDocument.getTitle()).isEqualTo("Backend Resume");
        assertThat(savedDocument.getSkills()).containsExactly("Java", "Spring Boot");
        assertThat(response.title()).isEqualTo("Backend Resume");
        assertThat(response.personalDetails().email()).isEqualTo("alex@example.com");
    }

    @Test
    void getThrowsWhenResumeDoesNotExist() {
        when(resumeRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resumeService.get("missing"))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("Resume not found");
    }

    @Test
    void listByUserMapsDocumentsToResponses() {
        ResumeDocument document = sampleDocument();
        when(resumeRepository.findByUserIdOrderByUpdatedAtDesc(42L)).thenReturn(List.of(document));

        List<ResumeResponse> responses = resumeService.listByUser(42L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).title()).isEqualTo("Backend Resume");
    }

    @Test
    void rewriteSectionDelegatesToAiClientWhenResumeExists() {
        AiRewriteRequest request = new AiRewriteRequest("Java Developer", "experience", "built APIs");
        AiRewriteResponse expected = new AiRewriteResponse("Built REST APIs using Spring Boot.");

        when(resumeRepository.existsById("resume-1")).thenReturn(true);
        when(aiGenieClient.rewrite(request)).thenReturn(expected);

        AiRewriteResponse response = resumeService.rewriteSection("resume-1", request);

        assertThat(response).isEqualTo(expected);
    }

    @Test
    void rewriteSectionThrowsWhenResumeDoesNotExist() {
        AiRewriteRequest request = new AiRewriteRequest("Java Developer", "experience", "built APIs");
        when(resumeRepository.existsById("missing")).thenReturn(false);

        assertThatThrownBy(() -> resumeService.rewriteSection("missing", request))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("Resume not found");
    }

    private static ResumeRequest sampleRequest() {
        return new ResumeRequest(
                42L,
                "Backend Resume",
                "Java Developer",
                new ResumeRequest.PersonalDetails(
                        "Alex Doe",
                        "alex@example.com",
                        "555-0100",
                        "Bengaluru",
                        "linkedin.com/in/alex",
                        "github.com/alex"),
                List.of(new ResumeRequest.Education("ABC University", "B.Tech", "CSE", "2020", "2024", "8.5")),
                List.of(new ResumeRequest.Experience("Acme", "Backend Intern", "2024", "2025", List.of("Built APIs"))),
                List.of(new ResumeRequest.Project("ResumeGenie", "Resume builder", List.of("Java"), List.of("Built backend"))),
                List.of("Java", "Spring Boot"),
                List.of("Won hackathon"));
    }

    private static ResumeDocument sampleDocument() {
        ResumeDocument document = new ResumeDocument();
        ResumeRequest request = sampleRequest();
        document.setUserId(request.userId());
        document.setTitle(request.title());
        document.setTargetRole(request.targetRole());
        document.setPersonalDetails(request.personalDetails());
        document.setEducation(request.education());
        document.setExperience(request.experience());
        document.setProjects(request.projects());
        document.setSkills(request.skills());
        document.setAchievements(request.achievements());
        return document;
    }
}
