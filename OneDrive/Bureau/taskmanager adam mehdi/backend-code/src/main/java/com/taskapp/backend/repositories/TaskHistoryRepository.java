package com.taskapp.backend.repositories;

import com.taskapp.backend.entities.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
    Page<TaskHistory> findByTaskId(Long taskId, Pageable pageable);
    Page<TaskHistory> findByModifiedById(Long userId, Pageable pageable);
    Page<TaskHistory> findByTaskIdOrderByModifiedAtDesc(Long taskId, Pageable pageable);
}