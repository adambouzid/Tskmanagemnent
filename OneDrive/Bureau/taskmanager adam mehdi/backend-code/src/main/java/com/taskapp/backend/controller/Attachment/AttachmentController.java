package com.taskapp.backend.controller.Attachment;

import com.taskapp.backend.dto.AttachmentDTO;
import com.taskapp.backend.services.Attachment.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("taskId") Long taskId,
            @RequestParam("uploadedById") Long uploadedById) throws IOException {
        return ResponseEntity.ok(attachmentService.uploadAttachment(file, taskId, uploadedById));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getAttachment(@PathVariable Long id) {
        return ResponseEntity.ok(attachmentService.getAttachmentById(id));
    }

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getAttachmentsByTask(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByTask(taskId, page, size));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok().build();
    }
}