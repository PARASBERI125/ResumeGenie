package com.resumegenie.resume.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI resumeServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ResumeGenie Resume Service")
                        .version("0.0.1")
                        .description("Resume management endpoints for ResumeGenie."));
    }
}
