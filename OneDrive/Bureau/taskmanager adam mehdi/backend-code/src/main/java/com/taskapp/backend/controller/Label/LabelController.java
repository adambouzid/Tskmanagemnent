package com.taskapp.backend.controller.Label;

import com.taskapp.backend.dto.LabelDTO;
import com.taskapp.backend.services.Label.LabelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labels")
@RequiredArgsConstructor
public class LabelController {

    private final LabelService labelService;

    @PostMapping
    public ResponseEntity<?> createLabel(@Valid @RequestBody LabelDTO labelDTO) {
        return ResponseEntity.ok(labelService.createLabel(labelDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLabel(@PathVariable Long id, @Valid @RequestBody LabelDTO labelDTO) {
        return ResponseEntity.ok(labelService.updateLabel(id, labelDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLabel(@PathVariable Long id) {
        labelService.deleteLabel(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLabel(@PathVariable Long id) {
        return ResponseEntity.ok(labelService.getLabelById(id));
    }

    @GetMapping
    public ResponseEntity<?> getAllLabels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LabelDTO> labels = labelService.getAllLabels(page, size);
        return ResponseEntity.ok(labels);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchLabels(@RequestParam String name) {
        List<LabelDTO> labels = labelService.searchLabelsByName(name);
        return ResponseEntity.ok(labels);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getLabelsByTask(@PathVariable Long taskId) {
        List<LabelDTO> labels = labelService.getLabelsByTaskId(taskId);
        return ResponseEntity.ok(labels);
    }

    @PostMapping("/task/{taskId}/label/{labelId}")
    public ResponseEntity<?> addLabelToTask(
            @PathVariable Long taskId,
            @PathVariable Long labelId) {
        labelService.addLabelToTask(taskId, labelId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/task/{taskId}/label/{labelId}")
    public ResponseEntity<?> removeLabelFromTask(
            @PathVariable Long taskId,
            @PathVariable Long labelId) {
        labelService.removeLabelFromTask(taskId, labelId);
        return ResponseEntity.ok().build();
    }
}