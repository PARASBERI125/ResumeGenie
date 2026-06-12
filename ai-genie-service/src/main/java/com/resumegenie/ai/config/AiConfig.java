package com.resumegenie.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }

    @Bean
    TokenTextSplitter tokenTextSplitter() {
        return TokenTextSplitter.builder()
                .withChunkSize(900)
                .withMinChunkSizeChars(250)
                .withMinChunkLengthToEmbed(20)
                .withMaxNumChunks(1000)
                .withKeepSeparator(true)
                .build();
    }
}
