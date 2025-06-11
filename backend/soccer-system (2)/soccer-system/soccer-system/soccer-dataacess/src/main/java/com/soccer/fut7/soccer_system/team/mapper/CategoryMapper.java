package com.soccer.fut7.soccer_system.team.mapper;

import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.ValueObject.AgeRange;
import com.soccer.fut7.soccer_system.ValueObject.CategoryDescription;
import com.soccer.fut7.soccer_system.ValueObject.CategoryName;
import com.soccer.fut7.soccer_system.team.entitiy.CategoryEntity;

import lombok.RequiredArgsConstructor;

// 3. Modify CategoryMapper to use the BaseMapper:
@Component
public class CategoryMapper extends BaseMapper implements EntityMapper<Category, CategoryEntity> {

    @Override
    public CategoryEntity toEntity(Category domain) {
        if (domain == null)
            return null;

        return CategoryEntity.builder()
                .id(domain.getId())
                .categoryName(domain.getName().value())
                .logoUrl(domain.getUrlPhoto())
                .minAge(domain.getAgeRange().minAge())
                .maxAge(domain.getAgeRange().maxAge())
                .build();
    }

    @Override
    public CategoryEntity UUIDtoEntity(UUID idCategory) {
        return CategoryEntity.builder()
                .id(idCategory)
                .build();
    }

    @Override
    public Category toDomain(CategoryEntity entity) {
        if (entity == null)
            return null;

        return Category.builder()
                .id(entity.getId())
                .name(new CategoryName(entity.getCategoryName()))
                .urlPhoto(entity.getLogoUrl())
                .ageRange(new AgeRange(entity.getMinAge(), entity.getMaxAge()))
                .build();
    }
}