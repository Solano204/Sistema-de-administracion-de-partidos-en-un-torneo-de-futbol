package com.soccer.fut7.soccer_system.ports.outport;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;


@Repository
public interface CategoryRepository {

    Optional<Category> existCategory(UUID category);

    Optional<List<Category>> getAllCategories();

    // Get category by ID
    Optional<Category> getCategoryById(UUID categoryId);

    // Insert a new category
    Optional<Category> insertCategory(Category category);

    // Update an existing category
    Optional <Category> updateCategory(UUID categoryId, Category updatedCategory);

    // Delete a category
    void deleteCategory(UUID categoryId);

    // Check if category exists
}