package com.taskapp.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class TaskHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    private User modifiedBy;

    private String field;
    private String oldValue;
    private String newValue;
    private LocalDateTime modifiedAt;
}