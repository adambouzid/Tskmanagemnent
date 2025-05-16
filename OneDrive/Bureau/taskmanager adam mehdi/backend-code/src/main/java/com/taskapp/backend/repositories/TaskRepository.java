package com.taskapp.backend.repositories;

import com.taskapp.backend.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    Page<Task> findByAssignedToId(Long userId, Pageable pageable);
    Page<Task> findByCreatedById(Long userId, Pageable pageable);
}