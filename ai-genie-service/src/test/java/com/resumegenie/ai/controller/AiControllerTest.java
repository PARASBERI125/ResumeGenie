package com.resumegenie.ai.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.resumegenie.ai.service.ResumeAiService;
import com.resumegenie.common.ai.AiBuildResumeRequest;
import com.resumegenie.common.ai.AiBuildResumeResponse;
import com.resumegenie.common.ai.AiRewriteRequest;
import com.resumegenie.common.ai.AiRewriteResponse;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class AiControllerTest {
    @Mock
    private ResumeAiService resumeAiService;

    @InjectMocks
    private AiController aiController;

    @Test
    void buildResumeReturnsServiceResponse() {
        AiBuildResumeRequest request = new AiBuildResumeRequest(
                "Java Developer",
                "Alex, Bengaluru",
                "B.Tech CSE",
                "Backend internship",
                "Resume builder",
                "Java, Spring Boot",
                "Hackathon winner");
        AiBuildResumeResponse expected = new AiBuildResumeResponse(
                "Java Developer Resume",
                "Java Developer",
                new AiBuildResumeResponse.PersonalDetails(
                        "Alex Doe",
                        "alex@example.com",
                        "555-0100",
                        "Bengaluru",
                        "linkedin.com/in/alex",
                        "github.com/alex"),
                List.of(),
                List.of(),
                List.of(),
                List.of("Java", "Spring Boot"),
                List.of("Won hackathon"));

        when(resumeAiService.buildResume(request)).thenReturn(expected);

        AiBuildResumeResponse response = aiController.buildResume(request);

        assertThat(response).isEqualTo(expected);
    }

    @Test
    void rewriteReturnsServiceResponse() {
        AiRewriteRequest request = new AiRewriteRequest("Java Developer", "experience", "built APIs");
        AiRewriteResponse expected = new AiRewriteResponse("Built REST APIs using Spring Boot.");
        when(resumeAiService.rewrite(request)).thenReturn(expected);

        AiRewriteResponse response = aiController.rewrite(request);

        assertThat(response).isEqualTo(expected);
    }

//    @Test
//    void ingestPdfReturnsStoredChunkCount() throws Exception {
//        MockMultipartFile file = new MockMultipartFile(
//                "file",
//                "resume-standard.pdf",
//                "application/pdf",
//                "pdf-content".getBytes());
//        when(resumeAiService.ingestPdf(file)).thenReturn(3);
//
//        Map<String, Object> response = aiController.ingestPdf(file);
//
//        assertThat(response).containsEntry("chunksStored", 3);
//    }
}