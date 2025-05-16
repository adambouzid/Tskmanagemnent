package com.taskapp.backend.services.Label;

import com.taskapp.backend.dto.LabelDTO;
import org.springframework.data.domain.Page;
import java.util.List;

public interface LabelService {
    LabelDTO createLabel(LabelDTO labelDTO);
    LabelDTO updateLabel(Long id, LabelDTO labelDTO);
    void deleteLabel(Long id);
    LabelDTO getLabelById(Long id);
    Page<LabelDTO> getAllLabels(int page, int size);
    List<LabelDTO> searchLabelsByName(String name);
    List<LabelDTO> getLabelsByTaskId(Long taskId);
    void addLabelToTask(Long taskId, Long labelId);
    void removeLabelFromTask(Long taskId, Long labelId);
}