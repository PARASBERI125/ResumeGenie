package com.resumegenie.gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI apiGatewayOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ResumeGenie API Gateway")
                        .version("0.0.1")
                        .description("Gateway routes for ResumeGenie backend services."));
    }
}
