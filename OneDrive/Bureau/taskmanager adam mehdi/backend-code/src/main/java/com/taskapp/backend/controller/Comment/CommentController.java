package com.taskapp.backend.controller.Comment;

import com.taskapp.backend.dto.CommentDTO;
import com.taskapp.backend.services.Comment.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> createComment(@Valid @RequestBody CommentDTO commentDTO) {
        return ResponseEntity.ok(commentService.createComment(commentDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @Valid @RequestBody CommentDTO commentDTO) {
        return ResponseEntity.ok(commentService.updateComment(id, commentDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentById(id));
    }

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getCommentsByTask(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(commentService.getCommentsByTask(taskId, page, size));
    }
}