package com.taskapp.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Entity
@Data
public class Label {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String color;

    @ManyToMany(mappedBy = "labels")
    private Set<Task> tasks;
}