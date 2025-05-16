package com.taskapp.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Data
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime dueDate;
    private String status;
    private String priority;

    @ManyToOne(fetch = FetchType.LAZY)
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    private User createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<Comment> comments;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<Attachment> attachments;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<TaskHistory> history;

    @ManyToMany
    @JoinTable(
            name = "task_labels",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    private Set<Label> labels;
}