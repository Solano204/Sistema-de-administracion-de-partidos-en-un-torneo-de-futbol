package com.soccer.fut7.soccer_system.serviceImpls.commandHandler;

import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.serviceImpls.commandHelper.CommandHelperCategory;

import lombok.AllArgsConstructor;

@Component
@Lazy  // Add this annotation
@AllArgsConstructor
public class CommandHandlerCategory {

    private final CommandHelperCategory commandHelperCategory;

    public Set<CategoryInfoRecord> getAllCategories() {
        return commandHelperCategory.getAllCategories();
    }

    public CategoryInfoRecord getCategoryById(UUID categoryId) {
        return commandHelperCategory.getCategoryById(categoryId);
    }

    public CategoryInfoRecord insertCategory(CategoryInfoRecord category) {
        return commandHelperCategory.insertCategory(category);
    }

    public CategoryInfoRecord updateCategory(UUID categoryId, CategoryInfoRecord updatedCategory) {
        return commandHelperCategory.updateCategory(categoryId, updatedCategory);
    }

    public void deleteCategory(UUID categoryId) {
        commandHelperCategory.deleteCategory(categoryId);
    }

    public boolean existCategory(UUID categoryId) {
        return commandHelperCategory.existCategory(categoryId);
    }
}
