package com.taskapp.backend.services.Comment;

import com.taskapp.backend.dto.CommentDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CommentService {
    CommentDTO createComment(CommentDTO commentDTO);
    CommentDTO updateComment(Long id, CommentDTO commentDTO);
    void deleteComment(Long id);
    CommentDTO getCommentById(Long id);

    List<CommentDTO> getCommentsByTaskId(Long taskId);

    Page<CommentDTO> getCommentsByTask(Long taskId, int page, int size);

}