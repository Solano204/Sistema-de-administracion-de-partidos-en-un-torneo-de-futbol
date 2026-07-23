package com.soccer.fut7.soccer_system.rest;

import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.ports.input.service.CategoryApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// Pure unit tests, no Spring context - CategoryController has no logic of
// its own beyond wrapping the ApplicationService's return value in a
// ResponseEntity, so these pin down that wrapping (right status code, right
// body) rather than re-testing business logic already covered by
// CommandHelperCategoryTest.
@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock private CategoryApplicationService categoryApplicationService;

    private CategoryController categoryController;

    @BeforeEach
    void setUp() {
        categoryController = new CategoryController(categoryApplicationService);
    }

    @Test
    void getAllCategories_returns200WithServiceResultAsBody() {
        Set<CategoryInfoRecord> categories = Set.of(new CategoryInfoRecord(UUID.randomUUID(), "Sub-17", null, null));
        when(categoryApplicationService.getAllCategories()).thenReturn(categories);

        ResponseEntity<Set<CategoryInfoRecord>> response = categoryController.getAllCategories();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(categories);
    }

    @Test
    void getCategoryById_delegatesIdAndReturns200WithTheResult() {
        UUID categoryId = UUID.randomUUID();
        CategoryInfoRecord record = new CategoryInfoRecord(categoryId, "Sub-17", null, null);
        when(categoryApplicationService.getCategoryById(categoryId)).thenReturn(record);

        ResponseEntity<CategoryInfoRecord> response = categoryController.getCategoryById(categoryId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(record);
    }

    @Test
    void createCategory_delegatesTheRequestBodyToTheService() {
        CategoryInfoRecord request = new CategoryInfoRecord(null, "Sub-17", null, null);
        CategoryInfoRecord created = new CategoryInfoRecord(UUID.randomUUID(), "Sub-17", null, null);
        when(categoryApplicationService.insertCategory(request)).thenReturn(created);

        ResponseEntity<CategoryInfoRecord> response = categoryController.createCategory(request);

        assertThat(response.getBody()).isSameAs(created);
    }

    @Test
    void deleteCategory_delegatesThenReturns204NoContent() {
        UUID categoryId = UUID.randomUUID();

        ResponseEntity<Void> response = categoryController.deleteCategory(categoryId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(categoryApplicationService).deleteCategory(categoryId);
    }

    @Test
    void categoryExists_returns200WithTheBooleanResultUnchanged() {
        UUID categoryId = UUID.randomUUID();
        when(categoryApplicationService.existCategory(categoryId)).thenReturn(false);

        ResponseEntity<Boolean> response = categoryController.categoryExists(categoryId);

        assertThat(response.getBody()).isFalse();
    }
}
