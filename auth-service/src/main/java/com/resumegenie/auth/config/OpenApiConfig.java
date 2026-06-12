package com.resumegenie.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI authServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ResumeGenie Auth Service")
                        .version("0.0.1")
                        .description("Authentication endpoints for ResumeGenie."));
    }
}
