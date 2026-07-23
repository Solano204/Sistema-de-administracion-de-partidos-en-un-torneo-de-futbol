package com.soccer.fut7.soccer_system.team.mapper;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.ValueObject.AgeRange;
import com.soccer.fut7.soccer_system.ValueObject.CategoryName;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Pure unit tests - CategoryMapper doesn't extend BaseMapper (no nested
// mapper lookups), so no ApplicationContext stubbing is needed here, unlike
// TeamMapper/PlayerMapper.
class CategoryMapperTest {

    private final CategoryMapper categoryMapper = new CategoryMapper();

    @Test
    void toEntity_domainIsNull_returnsNull() {
        assertThat(categoryMapper.toEntity(null)).isNull();
    }

    @Test
    void toEntity_allFieldsPresent_mapsEveryField() {
        UUID id = UUID.randomUUID();
        Category domain = Category.builder()
                .id(id)
                .name(new CategoryName("Sub-17"))
                .urlPhoto("photo.png")
                .ageRange(new AgeRange(15, 17))
                .build();

        CategoryEntity result = categoryMapper.toEntity(domain);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getCategoryName()).isEqualTo("Sub-17");
        assertThat(result.getLogoUrl()).isEqualTo("photo.png");
        assertThat(result.getMinAge()).isEqualTo(15);
        assertThat(result.getMaxAge()).isEqualTo(17);
    }

    @Test
    void toEntity_ageRangeIsNull_throwsNullPointerException() {
        // Documents current behavior: unlike TeamMapper.toEntity, this method
        // has no null-safety on name/ageRange at all - relies entirely on
        // CategoryInfoRecord's @NotNull/@Valid guaranteeing both are present
        // by the time a Category reaches this mapper.
        Category domain = Category.builder().id(UUID.randomUUID()).name(new CategoryName("Sub-17")).build();

        assertThatThrownBy(() -> categoryMapper.toEntity(domain)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void uuidToEntity_buildsAShellEntityWithOnlyTheIdSet() {
        UUID id = UUID.randomUUID();

        CategoryEntity result = categoryMapper.UUIDtoEntity(id);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getCategoryName()).isNull();
    }

    @Test
    void toDomain_entityIsNull_returnsNull() {
        assertThat(categoryMapper.toDomain(null)).isNull();
    }

    @Test
    void toDomain_allFieldsPresent_mapsEveryFieldIncludingTheAgeRangeWrapping() {
        UUID id = UUID.randomUUID();
        CategoryEntity entity = CategoryEntity.builder()
                .id(id)
                .categoryName("Sub-17")
                .logoUrl("photo.png")
                .minAge(15)
                .maxAge(17)
                .build();

        Category result = categoryMapper.toDomain(entity);

        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getName().value()).isEqualTo("Sub-17");
        assertThat(result.getUrlPhoto()).isEqualTo("photo.png");
        assertThat(result.getAgeRange()).isEqualTo(new AgeRange(15, 17));
    }
}
