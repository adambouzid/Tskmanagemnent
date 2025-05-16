package com.taskapp.backend.services.Comment;

import com.taskapp.backend.entities.Comment;
import com.taskapp.backend.entities.Task;
import com.taskapp.backend.entities.User;
import com.taskapp.backend.repositories.CommentRepository;
import com.taskapp.backend.repositories.TaskRepository;
import com.taskapp.backend.repositories.UserRepository;
import com.taskapp.backend.dto.CommentDTO;
import com.taskapp.backend.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final com.taskapp.backend.services.Notification.NotificationService notificationService;

    @Override
    @Transactional
    public CommentDTO createComment(CommentDTO commentDTO) {
        // Gestion du parent pour les threads
        Comment parent = null;
        if (commentDTO.getParentId() != null) {
            parent = commentRepository.findById(commentDTO.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Commentaire parent non trouvé"));
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long userId = null;
        try { userId = ((com.taskapp.backend.entities.User) auth.getPrincipal()).getId(); } catch (Exception e) { /* ignore */ }
        Task task = taskRepository.findById(commentDTO.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée"));
        if (!isAdmin && (task.getAssignedTo() == null || userId == null || task.getAssignedTo().getId() != userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Vous ne pouvez commenter que vos propres tâches");
        }
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setTask(task);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        comment.setCreatedBy(user);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setParent(parent);
        Comment savedComment = commentRepository.save(comment);
        // Notifications avancées sur les commentaires
        if (!isAdmin) {
            // Notifier tous les admins d'un nouveau commentaire d'employé
            java.util.List<User> admins = userRepository.findByUserRole(com.taskapp.backend.enums.UserRole.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification("Nouveau commentaire de " + user.getName() + " sur la tâche: " + task.getTitle(), admin.getId(), task.getId());
            }
        } else if (isAdmin && task.getAssignedTo() != null) {
            // Notifier l'employé si un admin commente sa tâche
            notificationService.createNotification("Un admin a commenté votre tâche: " + task.getTitle(), task.getAssignedTo().getId(), task.getId());
        }
        // Notifier l'auteur du commentaire parent si ce n'est pas lui-même
        if (parent != null && parent.getCreatedBy() != null && parent.getCreatedBy().getId() != user.getId()) {
            notificationService.createNotification("Réponse à votre commentaire sur la tâche: " + task.getTitle(), parent.getCreatedBy().getId(), task.getId());
        }
        return convertToDTO(savedComment);
    }

    @Override
    @Transactional
    public CommentDTO updateComment(Long id, CommentDTO commentDTO) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire non trouvé"));
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long userId = null;
        try { userId = ((com.taskapp.backend.entities.User) auth.getPrincipal()).getId(); } catch (Exception e) { /* ignore */ }
        if (!isAdmin && (comment.getCreatedBy() == null || userId == null || comment.getCreatedBy().getId() != userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Vous ne pouvez modifier que vos propres commentaires");
        }
        comment.setContent(commentDTO.getContent());
        return convertToDTO(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire non trouvé avec l'id: " + id));
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long userId = null;
        try { userId = ((com.taskapp.backend.entities.User) auth.getPrincipal()).getId(); } catch (Exception e) { /* ignore */ }
        if (!isAdmin && (comment.getCreatedBy() == null || userId == null || comment.getCreatedBy().getId() != userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Vous ne pouvez supprimer que vos propres commentaires");
        }
        commentRepository.delete(comment);
    }

    @Override
    public CommentDTO getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire non trouvé avec l'id: " + id));
        return convertToDTO(comment);
    }

    @Override
    public List<CommentDTO> getCommentsByTaskId(Long taskId) {
        // Récupérer uniquement les commentaires racines (parent == null)
        List<Comment> rootComments = commentRepository.findByTaskIdAndParentIsNull(taskId);
        List<CommentDTO> rootDTOs = new ArrayList<>();
        for (Comment comment : rootComments) {
            rootDTOs.add(convertToDTOWithReplies(comment));
        }
        return rootDTOs;
    }

    @Override
    public Page<CommentDTO> getCommentsByTask(Long taskId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findByTaskId(taskId, pageRequest);
        return commentPage.map(this::convertToDTO);
    }

    private void updateCommentFromDTO(Comment comment, CommentDTO commentDTO) {
        comment.setContent(commentDTO.getContent());

        Task task = taskRepository.findById(commentDTO.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée"));
        comment.setTask(task);

        if (commentDTO.getCreatedById() != null) {
            User createdBy = userRepository.findById(commentDTO.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
            comment.setCreatedBy(createdBy);
        }
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setTaskId(comment.getTask().getId());

        if (comment.getCreatedBy() != null) {
            dto.setCreatedById(comment.getCreatedBy().getId());
            dto.setCreatedByName(comment.getCreatedBy().getUsername()); // Assurez-vous que l'entité User a un champ username
        }

        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    // Conversion récursive d'un commentaire et de ses réponses en DTO
    private CommentDTO convertToDTOWithReplies(Comment comment) {
        CommentDTO dto = convertToDTO(comment);
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentDTO> repliesDTO = new ArrayList<>();
            for (Comment reply : comment.getReplies()) {
                repliesDTO.add(convertToDTOWithReplies(reply));
            }
            dto.setReplies(repliesDTO);
        }
        return dto;
    }
}