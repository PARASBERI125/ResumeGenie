package com.resumegenie.resume.controller;

import com.resumegenie.common.ai.AiRewriteRequest;
import com.resumegenie.common.ai.AiRewriteResponse;
import com.resumegenie.common.resume.ResumeRequest;
import com.resumegenie.common.resume.ResumeResponse;
import com.resumegenie.resume.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resumes")
@Tag(name = "Resumes", description = "Create, retrieve, update, delete, and rewrite resumes")
public class ResumeController {
    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a resume")
    ResumeResponse create(@Valid @RequestBody ResumeRequest request) {
        return resumeService.create(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a resume by ID")
    ResumeResponse get(@PathVariable("id") String id) {
        return resumeService.get(id);
    }

    @GetMapping
    @Operation(summary = "List resumes for a user")
    List<ResumeResponse> list(@RequestParam("userId") Long userId) {
        return resumeService.listByUser(userId);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a resume")
    ResumeResponse update(@PathVariable("id") String id, @Valid @RequestBody ResumeRequest request) {
        return resumeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a resume")
    void delete(@PathVariable("id") String id) {
        resumeService.delete(id);
    }

    @PostMapping("/{id}/rewrite")
    @Operation(summary = "Rewrite a resume section with AI")
    AiRewriteResponse rewrite(@PathVariable("id") String id, @Valid @RequestBody AiRewriteRequest request) {
        return resumeService.rewriteSection(id, request);
    }
}
