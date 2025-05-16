package com.taskapp.backend.services.Attachment;

import com.taskapp.backend.entities.Attachment;
import com.taskapp.backend.entities.Task;
import com.taskapp.backend.entities.User;
import com.taskapp.backend.repositories.AttachmentRepository;
import com.taskapp.backend.repositories.TaskRepository;
import com.taskapp.backend.repositories.UserRepository;
import com.taskapp.backend.dto.AttachmentDTO;
import com.taskapp.backend.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional
    public AttachmentDTO uploadAttachment(MultipartFile file, Long taskId, Long uploadedById) throws IOException {
        // Créer le répertoire de téléchargement s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom de fichier unique
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        
        // Chemin complet du fichier
        Path filePath = uploadPath.resolve(uniqueFilename);
        
        // Enregistrer le fichier sur le disque
        Files.copy(file.getInputStream(), filePath);

        // Créer l'entité Attachment
        Attachment attachment = new Attachment();
        attachment.setFileName(originalFilename);
        attachment.setFileType(file.getContentType());
        attachment.setFilePath(filePath.toString());
        attachment.setFileSize(file.getSize());
        attachment.setUploadedAt(LocalDateTime.now());
        
        // Associer à la tâche
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée"));
        attachment.setTask(task);
        
        // Associer à l'utilisateur qui a téléchargé
        User uploadedBy = userRepository.findById(uploadedById)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        attachment.setUploadedBy(uploadedBy);
        
        // Sauvegarder l'attachment dans la base de données
        Attachment savedAttachment = attachmentRepository.save(attachment);
        
        return convertToDTO(savedAttachment);
    }

    @Override
    public AttachmentDTO getAttachmentById(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pièce jointe non trouvée avec l'id: " + id));
        return convertToDTO(attachment);
    }

    @Override
    public Page<AttachmentDTO> getAttachmentsByTask(Long taskId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Attachment> attachmentPage = attachmentRepository.findByTaskId(taskId, pageRequest);
        return attachmentPage.map(this::convertToDTO);
    }

    @Override
    @Transactional
    public void deleteAttachment(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pièce jointe non trouvée avec l'id: " + id));
        
        // Supprimer le fichier physique
        try {
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Logger l'erreur mais continuer la suppression de l'enregistrement
            System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
        }
        
        // Supprimer l'enregistrement de la base de données
        attachmentRepository.delete(attachment);
    }

    private AttachmentDTO convertToDTO(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setTaskId(attachment.getTask().getId());
        
        if (attachment.getUploadedBy() != null) {
            dto.setUploadedById(attachment.getUploadedBy().getId());
            dto.setUploadedByName(attachment.getUploadedBy().getUsername()); // Assurez-vous que l'entité User a un champ username
        }
        
        dto.setUploadedAt(attachment.getUploadedAt());
        return dto;
    }
}