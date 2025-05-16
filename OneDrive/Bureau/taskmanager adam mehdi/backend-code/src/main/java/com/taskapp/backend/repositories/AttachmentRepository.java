package com.taskapp.backend.repositories;

import com.taskapp.backend.entities.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    Page<Attachment> findByTaskId(Long taskId, Pageable pageable);
    Page<Attachment> findByUploadedById(Long userId, Pageable pageable);
}