package com.resumegenie.ai.service;

import com.resumegenie.common.ai.AiBuildResumeRequest;
import com.resumegenie.common.ai.AiBuildResumeResponse;
import com.resumegenie.common.ai.AiRewriteRequest;
import com.resumegenie.common.ai.AiRewriteResponse;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.ExtractedTextFormatter;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeAiService {
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final TokenTextSplitter tokenTextSplitter;

    public ResumeAiService(ChatClient chatClient, VectorStore vectorStore, TokenTextSplitter tokenTextSplitter) {
        this.chatClient = chatClient;
        this.vectorStore = vectorStore;
        this.tokenTextSplitter = tokenTextSplitter;
    }

    public AiBuildResumeResponse buildResume(AiBuildResumeRequest request) {
        String context = retrieveContext(request.targetRole() + " resume standards ats best practices");

        return chatClient.prompt()
                .system("""
                        You are ResumeGenie, an AI resume assistant.
                        Build a complete, professional, and ATS-friendly resume using the user's rough notes.
                        Expand on the rough notes to create impactful, metric-driven bullet points.
                        Keep the result truthful but make it sound professional and tailored to the target role.
                        Use the provided resume-standard context when relevant.
                        Ensure the output perfectly matches the requested structure.
                        """)
                .user("""
                        Target role: %s
                        Basic Details: %s
                        Experience Notes: %s
                        Education Notes: %s
                        Project Notes: %s
                        Skills Notes: %s
                        Achievements Notes: %s

                        Resume-standard context:
                        %s
                        """.formatted(
                        request.targetRole(),
                        request.basicDetails(),
                        request.experienceNotes(),
                        request.educationNotes(),
                        request.projectNotes(),
                        request.skillsNotes(),
                        request.achievementsNotes(),
                        context))
                .call()
                .entity(AiBuildResumeResponse.class);
    }

    public AiRewriteResponse rewrite(AiRewriteRequest request) {
        String context = retrieveContext(request.targetRole() + " " + request.sectionType() + " resume standards");

        String improved = chatClient.prompt()
                .system("""
                        You are ResumeGenie, an AI resume assistant.
                        Improve resume content for clarity, readability, measurable impact, and professional tone.
                        Keep the result truthful, concise, and ready to paste into a resume.
                        Use the provided resume-standard context when relevant.
                        """)
                .user("""
                        Target role: %s
                        Section type: %s

                        Resume-standard context:
                        %s

                        Original text:
                        %s

                        Return only the improved resume text.
                        """.formatted(request.targetRole(), request.sectionType(), context, request.originalText()))
                .call()
                .content();

        return new AiRewriteResponse(improved);
    }

    public int ingestPdf(MultipartFile file) throws IOException {
        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        PdfDocumentReaderConfig config = PdfDocumentReaderConfig.builder()
                .withPageTopMargin(0)
                .withPageExtractedTextFormatter(ExtractedTextFormatter.builder()
                        .withNumberOfTopTextLinesToDelete(0)
                        .build())
                .withPagesPerDocument(1)
                .build();

        PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource, config);
        List<Document> chunks = tokenTextSplitter.split(pdfReader.read());
        vectorStore.write(chunks);
        return chunks.size();
    }

    private String retrieveContext(String query) {
        List<Document> matches = vectorStore.similaritySearch(SearchRequest.builder()
                .query(query)
                .topK(4)
                .build());

        if (matches == null || matches.isEmpty()) {
            return "No stored resume-standard context found.";
        }

        return matches.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));
    }

    public AiBuildResumeResponse parsePdf(MultipartFile file) throws IOException {
        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        PdfDocumentReaderConfig config = PdfDocumentReaderConfig.builder()
                .withPageTopMargin(0)
                .withPageExtractedTextFormatter(ExtractedTextFormatter.builder()
                        .withNumberOfTopTextLinesToDelete(0)
                        .build())
                .withPagesPerDocument(1)
                .build();

        PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource, config);
        String text = pdfReader.read().stream().map(Document::getText).collect(Collectors.joining("\n"));

        return chatClient.prompt()
                .system("""
                        You are ResumeGenie, an AI resume assistant.
                        Extract the candidate's details from the provided resume text.
                        Map them to a structured JSON response matching the expected schema.
                        """)
                .user(text)
                .call()
                .entity(AiBuildResumeResponse.class);
    }
}
