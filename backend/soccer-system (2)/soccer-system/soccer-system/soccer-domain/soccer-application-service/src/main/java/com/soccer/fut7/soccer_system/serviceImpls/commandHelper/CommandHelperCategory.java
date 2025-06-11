package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.ExceptionApplication.categoryException;
import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.mappers.CategoryMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.CategoryRepository;

import lombok.AllArgsConstructor;

@Component
@Lazy
@AllArgsConstructor
public class CommandHelperCategory {
    // Get all categories
    private final CategoryRepository categoryRepository;
    private final CategoryMapperDomain categoryMapper;

    public Set<CategoryInfoRecord> getAllCategories() {
        return categoryMapper.categoryListToCategoryInfoRecordSet(categoryRepository.getAllCategories().orElseThrow( () -> new categoryException("Category not found")));
    }

    // Get category by ID
   public CategoryInfoRecord getCategoryById(UUID categoryId) {
        return categoryMapper.categoryToCategoryInfoRecord(categoryRepository.getCategoryById(categoryId).orElseThrow( () -> new categoryException("Category not found")));
    }

    // Insert a new category
   public CategoryInfoRecord insertCategory(CategoryInfoRecord category) {
        return categoryMapper.categoryToCategoryInfoRecord(categoryRepository.insertCategory(categoryMapper.categoryInfoRecordToCategory(category)).orElseThrow( () -> new categoryException("Category not found")));
    }

    // Update an existing category
   public CategoryInfoRecord updateCategory(UUID categoryId, CategoryInfoRecord updatedCategory) {
        return categoryMapper.categoryToCategoryInfoRecord(categoryRepository.updateCategory(categoryId,categoryMapper.categoryInfoRecordToCategory(updatedCategory)).orElseThrow( () -> new categoryException("Category not found")));
    }   

    // Delete a category
     public   void deleteCategory(UUID categoryId) {
        categoryRepository.deleteCategory(categoryId);
    }

    // Check if category exists
    public boolean existCategory(UUID categoryId) {
        return categoryRepository.existCategory(categoryId).isPresent();
    }
}
