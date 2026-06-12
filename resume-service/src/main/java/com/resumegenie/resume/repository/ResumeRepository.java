package com.resumegenie.resume.repository;

import com.resumegenie.resume.model.ResumeDocument;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResumeRepository extends MongoRepository<ResumeDocument, String> {
    List<ResumeDocument> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
