package com.soccer.fut7.soccer_system.rest;

import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.CategoryApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Categories", description = "Age/division categories a tournament is organized into (e.g. Varonil Libre, Femenil, Sub-17)")
@RestController
@RequestMapping("/categories")
@AllArgsConstructor
@Validated
public class CategoryController {

    private final CategoryApplicationService categoryApplicationService;

    @Operation(summary = "List all categories")
    @ApiResponse(responseCode = "200", description = "Categories returned successfully", content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(value = """
                    [
                      { "id": "b3f1a2c4-1234-4a5b-8c9d-000000000001", "name": "Varonil Libre", "description": "Open men's division" },
                      { "id": "b3f1a2c4-1234-4a5b-8c9d-000000000002", "name": "Femenil", "description": "Women's division" }
                    ]""")))
    @GetMapping
    public ResponseEntity<Set<CategoryInfoRecord>> getAllCategories() {
        return ResponseEntity.ok(categoryApplicationService.getAllCategories());
    }

    @Operation(summary = "Get a category by id")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Category found"),
        @ApiResponse(responseCode = "404", description = "No category exists with that id", content = @Content(
                examples = @ExampleObject(value = """
                        { "timestamp": "2026-07-18T12:00:00Z", "status": 404, "error": "Not Found", "message": "Category not found", "path": "/categories/b3f1a2c4-..." }""")))
    })
    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryInfoRecord> getCategoryById(
            @Parameter(description = "Category UUID", example = "b3f1a2c4-1234-4a5b-8c9d-000000000001")
            @PathVariable @NotNull(message = "Category ID cannot be null") UUID categoryId) {
        return ResponseEntity.ok(categoryApplicationService.getCategoryById(categoryId));
    }

    @Operation(summary = "Create a category")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Category created"),
        @ApiResponse(responseCode = "400", description = "Validation failed (e.g. missing name)"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PostMapping
    public ResponseEntity<CategoryInfoRecord> createCategory(
            @RequestBody @Valid CategoryInfoRecord category) {
        return ResponseEntity.ok(categoryApplicationService.insertCategory(category));
    }

    @Operation(summary = "Update a category")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Category updated"),
        @ApiResponse(responseCode = "404", description = "No category exists with that id"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryInfoRecord> updateCategory(
            @PathVariable @NotNull(message = "Category ID cannot be null") UUID categoryId,
            @RequestBody @Valid CategoryInfoRecord updatedCategory) {
        return ResponseEntity.ok(categoryApplicationService.updateCategory(categoryId, updatedCategory));
    }

    @Operation(summary = "Delete a category")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Category deleted"),
        @ApiResponse(responseCode = "409", description = "Category has teams/matches referencing it (foreign key violation)"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid token")
    })
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable @NotNull(message = "Category ID cannot be null") UUID categoryId) {
        categoryApplicationService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Check whether a category exists")
    @ApiResponse(responseCode = "200", description = "true if the category exists, false otherwise")
    @GetMapping("/exist")
    public ResponseEntity<Boolean> categoryExists(
            @Parameter(description = "Category UUID to check")
            @RequestParam @NotNull(message = "Category ID cannot be null") UUID categoryId) {
        return ResponseEntity.ok(categoryApplicationService.existCategory(categoryId));
    }
}
