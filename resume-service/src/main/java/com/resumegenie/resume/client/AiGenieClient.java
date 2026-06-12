package com.resumegenie.resume.client;

import com.resumegenie.common.ai.AiRewriteRequest;
import com.resumegenie.common.ai.AiRewriteResponse;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ai-genie-service", url = "${services.ai-genie.url:http://localhost:8083}")
public interface AiGenieClient {
    @PostMapping("/api/ai/rewrite")
    AiRewriteResponse rewrite(@Valid @RequestBody AiRewriteRequest request);
}
