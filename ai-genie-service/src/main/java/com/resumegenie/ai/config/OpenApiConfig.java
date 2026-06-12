package com.resumegenie.ai.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI aiGenieServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ResumeGenie AI Service")
                        .version("0.0.1")
                        .description("AI resume generation, rewrite, and knowledge ingestion endpoints."));
    }
}
