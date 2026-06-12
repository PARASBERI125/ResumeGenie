# ResumeGenie Backend

ResumeGenie is an AI resume assistant backend built as Spring Boot microservices.

## Modules

- `api-gateway`: routes frontend traffic to backend services.
- `auth-service`: user registration/login using JWT, BCrypt, and MySQL.
- `resume-service`: resume CRUD/version management using MongoDB and OpenFeign.
- `ai-genie-service`: Spring AI powered resume rewriting and PDF knowledge ingestion.
- `common`: shared DTOs used across services.

## AI Constraint

The AI/RAG flow stays inside Spring AI:

`PDF -> PagePdfDocumentReader -> TokenTextSplitter -> EmbeddingModel -> VectorStore -> ChatClient`

No external PDF parsing, chunking, embedding, or RAG libraries are used.

## Local Ports

- Gateway: `8080`
- Auth service: `8081`
- Resume service: `8082`
- AI Genie service: `8083`

## Required Environment

- `MYSQL_URL`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `MISTRAL_API_KEY`
- `QDRANT_HOST`, `QDRANT_PORT`, `QDRANT_API_KEY`

Defaults are present for local development where safe, but production secrets should always be supplied through environment variables.
