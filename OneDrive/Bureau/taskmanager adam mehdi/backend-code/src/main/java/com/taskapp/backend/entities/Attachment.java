package com.taskapp.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;
    private String filePath;
    private Long fileSize;

    @ManyToOne(fetch = FetchType.LAZY)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    private User uploadedBy;

    private LocalDateTime uploadedAt;
}