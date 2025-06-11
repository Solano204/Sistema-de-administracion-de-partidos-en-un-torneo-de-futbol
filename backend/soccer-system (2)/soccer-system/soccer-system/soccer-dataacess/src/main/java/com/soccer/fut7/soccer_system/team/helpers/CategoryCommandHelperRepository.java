package com.soccer.fut7.soccer_system.team.helpers;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.repository.CategoryRepositoryData;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Lazy

public class CategoryCommandHelperRepository {

    private final CategoryRepositoryData categoryRepositoryData;

    public Optional<CategoryEntity> existCategory(UUID categoryId) {
        return categoryRepositoryData.findById(categoryId);
    }

    public Optional<List<CategoryEntity>> getAllCategories() {
        List<CategoryEntity> categories = categoryRepositoryData.findAll();
        return Optional.of(categories);
    }

    public Optional<CategoryEntity> getCategoryById(UUID categoryId) {
        return categoryRepositoryData.findById(categoryId);
    }

    public Optional<CategoryEntity> insertCategory(CategoryEntity categoryEntity) {
        CategoryEntity savedCategory = categoryRepositoryData.save(categoryEntity);
        return Optional.of(savedCategory);
    }

    public Optional<CategoryEntity> updateCategory(UUID categoryId, CategoryEntity updatedCategoryEntity) {
        return categoryRepositoryData.findById(categoryId)
            .map(existingCategory -> {
                // Solo actualiza si el nombre no es null ni vacío
                if (updatedCategoryEntity.getCategoryName() != null && !updatedCategoryEntity.getCategoryName().isBlank()) {
                    existingCategory.setCategoryName(updatedCategoryEntity.getCategoryName());
                }
    
                // Solo actualiza si la edad mínima no es null
                if (updatedCategoryEntity.getMinAge() != null) {
                    existingCategory.setMinAge(updatedCategoryEntity.getMinAge());
                }
    
                // Solo actualiza si la edad máxima no es null
                if (updatedCategoryEntity.getMaxAge() != null) {
                    existingCategory.setMaxAge(updatedCategoryEntity.getMaxAge());
                }
    
                // Solo actualiza si el logo no es null ni vacío
                if (updatedCategoryEntity.getLogoUrl() != null && !updatedCategoryEntity.getLogoUrl().isBlank()) {
                    existingCategory.setLogoUrl(updatedCategoryEntity.getLogoUrl());
                }
    
                return categoryRepositoryData.save(existingCategory);
            });
    }
    

    public void deleteCategory(UUID categoryId) {
        categoryRepositoryData.deleteById(categoryId);
    }
}