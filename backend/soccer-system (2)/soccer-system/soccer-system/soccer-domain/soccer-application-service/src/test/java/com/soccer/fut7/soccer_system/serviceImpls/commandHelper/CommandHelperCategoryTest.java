package com.soccer.fut7.soccer_system.serviceImpls.commandHelper;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.ExceptionApplication.categoryException;
import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.mappers.CategoryMapperDomain;
import com.soccer.fut7.soccer_system.ports.outport.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

// Pure unit tests, Mockito-isolated - CommandHelperCategory is thin
// repository+mapper delegation with no branching of its own; these pin down
// its one real behavior (throwing categoryException whenever the repository
// returns empty) for every method, plus that the happy path routes through
// the mapper rather than returning the repository's raw entity.
@ExtendWith(MockitoExtension.class)
class CommandHelperCategoryTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private CategoryMapperDomain categoryMapper;

    private CommandHelperCategory commandHelperCategory;

    @BeforeEach
    void setUp() {
        commandHelperCategory = new CommandHelperCategory(categoryRepository, categoryMapper);
    }

    @Test
    void getAllCategories_repositoryReturnsEmpty_throwsCategoryException() {
        when(categoryRepository.getAllCategories()).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperCategory.getAllCategories())
                .isInstanceOf(categoryException.class);
    }

    @Test
    void getAllCategories_repositoryReturnsCategories_mapsThemThroughTheMapper() {
        List<Category> categories = List.of(Category.builder().build());
        Set<CategoryInfoRecord> mapped = Set.of(new CategoryInfoRecord(UUID.randomUUID(), "Sub-17", null, null));
        when(categoryRepository.getAllCategories()).thenReturn(Optional.of(categories));
        when(categoryMapper.categoryListToCategoryInfoRecordSet(categories)).thenReturn(mapped);

        assertThat(commandHelperCategory.getAllCategories()).isSameAs(mapped);
    }

    @Test
    void getCategoryById_notFound_throwsCategoryException() {
        UUID id = UUID.randomUUID();
        when(categoryRepository.getCategoryById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperCategory.getCategoryById(id))
                .isInstanceOf(categoryException.class);
    }

    @Test
    void insertCategory_repositoryFailsToInsert_throwsCategoryException() {
        CategoryInfoRecord record = new CategoryInfoRecord(null, "Sub-17", null, null);
        Category mapped = Category.builder().build();
        when(categoryMapper.categoryInfoRecordToCategory(record)).thenReturn(mapped);
        when(categoryRepository.insertCategory(mapped)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandHelperCategory.insertCategory(record))
                .isInstanceOf(categoryException.class);
    }

    @Test
    void deleteCategory_delegatesDirectlyToRepository() {
        UUID id = UUID.randomUUID();

        commandHelperCategory.deleteCategory(id);

        verify(categoryRepository).deleteCategory(id);
    }

    @Test
    void existCategory_repositoryHasIt_returnsTrue() {
        UUID id = UUID.randomUUID();
        when(categoryRepository.existCategory(id)).thenReturn(Optional.of(Category.builder().build()));

        assertThat(commandHelperCategory.existCategory(id)).isTrue();
    }

    @Test
    void existCategory_repositoryDoesNotHaveIt_returnsFalse() {
        UUID id = UUID.randomUUID();
        when(categoryRepository.existCategory(id)).thenReturn(Optional.empty());

        assertThat(commandHelperCategory.existCategory(id)).isFalse();
    }
}
