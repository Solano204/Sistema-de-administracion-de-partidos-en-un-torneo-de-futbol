package com.soccer.fut7.soccer_system.rest;

import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.CategoryApplicationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.Set;

@RestController
@RequestMapping("/categories")
@AllArgsConstructor
@Validated
public class CategoryController {
    
    private final CategoryApplicationService categoryApplicationService;
    
    @GetMapping
    public ResponseEntity<Set<CategoryInfoRecord>> getAllCategories() {
        return ResponseEntity.ok(categoryApplicationService.getAllCategories());
    }
    
    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryInfoRecord> getCategoryById(
            @PathVariable @NotNull(message = "Category ID cannot be null") UUID categoryId) {
        return ResponseEntity.ok(categoryApplicationService.getCategoryById(categoryId));
    }
    
    @PostMapping
    public ResponseEntity<CategoryInfoRecord> createCategory(
            @RequestBody @Valid CategoryInfoRecord category) {
        return ResponseEntity.ok(categoryApplicationService.insertCategory(category));
    }
    
    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryInfoRecord> updateCategory(
            @PathVariable @NotNull(message = "Category ID cannot be null") UUID categoryId,
            @RequestBody @Valid CategoryInfoRecord updatedCategory) {
        return ResponseEntity.ok(categoryApplicationService.updateCategory(categoryId, updatedCategory));
    }
    
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable @NotNull(message = "Category ID cannot be null") UUID categoryId) {
        categoryApplicationService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/exist")
    public ResponseEntity<Boolean> categoryExists(
            @RequestParam @NotNull(message = "Category ID cannot be null") UUID categoryId) {
        return ResponseEntity.ok(categoryApplicationService.existCategory(categoryId));
    }
}