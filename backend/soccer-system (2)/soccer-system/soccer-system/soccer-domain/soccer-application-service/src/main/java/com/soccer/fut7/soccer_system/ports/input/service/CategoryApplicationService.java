package com.soccer.fut7.soccer_system.ports.input.service;

import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;

public interface CategoryApplicationService {
    Set<CategoryInfoRecord> getAllCategories();
    CategoryInfoRecord getCategoryById(UUID categoryId);
    CategoryInfoRecord insertCategory(CategoryInfoRecord category);
    CategoryInfoRecord updateCategory(UUID categoryId, CategoryInfoRecord updatedCategory);
    void deleteCategory(UUID categoryId);
    boolean existCategory(UUID categoryId);
}
