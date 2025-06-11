package com.soccer.fut7.soccer_system.serviceImpls;

import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.CategoryApplicationService;
import com.soccer.fut7.soccer_system.serviceImpls.commandHandler.CommandHandlerCategory;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
@Lazy
public class CategoryApplicationServiceImpl implements CategoryApplicationService {

    private final CommandHandlerCategory commandHandlerCategory;

    @Override
    public Set<CategoryInfoRecord> getAllCategories() {
        return commandHandlerCategory.getAllCategories();
    }

    @Override
    public CategoryInfoRecord getCategoryById(UUID categoryId) {
        return commandHandlerCategory.getCategoryById(categoryId);
    }

    @Override
    public CategoryInfoRecord insertCategory(CategoryInfoRecord category) {
        return commandHandlerCategory.insertCategory(category);
    }

    @Override
    public CategoryInfoRecord updateCategory(UUID categoryId, CategoryInfoRecord updatedCategory) {
        return commandHandlerCategory.updateCategory(categoryId, updatedCategory);
    }

    @Override
    public void deleteCategory(UUID categoryId) {
        commandHandlerCategory.deleteCategory(categoryId);
    }

    @Override
    public boolean existCategory(UUID categoryId) {
        return commandHandlerCategory.existCategory(categoryId);
    }
}
