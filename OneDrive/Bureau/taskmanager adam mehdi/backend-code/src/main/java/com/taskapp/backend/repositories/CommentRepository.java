package com.taskapp.backend.repositories;

import com.taskapp.backend.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskIdAndParentIsNull(Long taskId);

    Page<Comment> findByTaskId(Long taskId, Pageable pageable);
    Page<Comment> findByCreatedById(Long userId, Pageable pageable);
}