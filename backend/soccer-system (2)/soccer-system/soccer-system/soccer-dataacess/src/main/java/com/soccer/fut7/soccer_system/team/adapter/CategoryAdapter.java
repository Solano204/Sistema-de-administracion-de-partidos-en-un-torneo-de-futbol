package com.soccer.fut7.soccer_system.team.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.ports.input.service.CategoryApplicationService;
import com.soccer.fut7.soccer_system.ports.outport.CategoryRepository;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import com.soccer.fut7.soccer_system.team.helpers.CategoryCommandHelperRepository;
import com.soccer.fut7.soccer_system.team.mapper.CategoryMapper;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Lazy

public class CategoryAdapter implements CategoryRepository {

    private final CategoryCommandHelperRepository categoryCommandHelperRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public Optional<Category> existCategory(UUID category) {
        return categoryCommandHelperRepository.existCategory(category)
            .map(categoryMapper::toDomain);
    }

    @Override
    public Optional<List<Category>> getAllCategories() {
        return categoryCommandHelperRepository.getAllCategories()
            .map(categories -> categories.stream()
                .map(categoryMapper::toDomain)
                .collect(Collectors.toList()));
    }

    @Override
    public Optional<Category> getCategoryById(UUID categoryId) {
        return categoryCommandHelperRepository.getCategoryById(categoryId)
            .map(categoryMapper::toDomain);
    }

    @Override
    public Optional<Category> insertCategory(Category category) {
        CategoryEntity categoryEntity = categoryMapper.toEntity(category);
        return categoryCommandHelperRepository.insertCategory(categoryEntity)
            .map(categoryMapper::toDomain);
    }

    @Override
    public Optional<Category> updateCategory(UUID categoryId, Category updatedCategory) {
        CategoryEntity categoryEntity = categoryMapper.toEntity(updatedCategory);
        return categoryCommandHelperRepository.updateCategory(categoryId, categoryEntity)
            .map(categoryMapper::toDomain);
    }

    @Override
    public void deleteCategory(UUID categoryId) {
        categoryCommandHelperRepository.deleteCategory(categoryId);
    }
}