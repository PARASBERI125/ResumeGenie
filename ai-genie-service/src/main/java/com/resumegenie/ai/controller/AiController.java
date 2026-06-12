package com.resumegenie.ai.controller;

import com.resumegenie.ai.service.ResumeAiService;
import com.resumegenie.common.ai.AiBuildResumeRequest;
import com.resumegenie.common.ai.AiBuildResumeResponse;
import com.resumegenie.common.ai.AiRewriteRequest;
import com.resumegenie.common.ai.AiRewriteResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Resume Assistant", description = "Generate and improve resume content")
public class AiController {
    private final ResumeAiService resumeAiService;

    public AiController(ResumeAiService resumeAiService) {
        this.resumeAiService = resumeAiService;
    }

    @PostMapping("/build-resume")
    @Operation(summary = "Build a complete resume from rough notes")
    AiBuildResumeResponse buildResume(@Valid @RequestBody AiBuildResumeRequest request) {
        return resumeAiService.buildResume(request);
    }

    @PostMapping("/rewrite")
    @Operation(summary = "Rewrite resume content for a target role")
    AiRewriteResponse rewrite(@Valid @RequestBody AiRewriteRequest request) {
        return resumeAiService.rewrite(request);
    }

    @PostMapping(value = "/knowledge/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Ingest a resume-standard PDF into the vector store")
    Map<String, Object> ingestPdf(@RequestPart("file") MultipartFile file) throws IOException {
        int chunks = resumeAiService.ingestPdf(file);
        return Map.of("chunksStored", chunks);
    }

    @PostMapping(value = "/parse-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Parse a PDF resume into structured notes")
    AiBuildResumeResponse parsePdf(@RequestPart("file") MultipartFile file) throws IOException {
        return resumeAiService.parsePdf(file);
    }
}