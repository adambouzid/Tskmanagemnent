package com.taskapp.backend.services.Attachment;

import com.taskapp.backend.dto.AttachmentDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface AttachmentService {
    AttachmentDTO uploadAttachment(MultipartFile file, Long taskId, Long uploadedById) throws IOException;
    AttachmentDTO getAttachmentById(Long id);
    Page<AttachmentDTO> getAttachmentsByTask(Long taskId, int page, int size);
    void deleteAttachment(Long id);
}