package com.soccer.fut7.soccer_system.mappers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.soccer.fut7.soccer_system.EntityApplication.Category;
import com.soccer.fut7.soccer_system.ValueObject.AgeRange;
import com.soccer.fut7.soccer_system.ValueObject.CategoryName;
import com.soccer.fut7.soccer_system.dto.category.CategoryInfoRecord;
import com.soccer.fut7.soccer_system.dto.utility.AgeRangeRecord;

@Component
@Lazy
public class CategoryMapperDomain {

    public CategoryInfoRecord categoryToCategoryInfoRecord(Category category) {
        if (category == null) {
            return null;
        }

        String name = category.getName() != null ? category.getName().value() : "";
        String imageUrl = category.getUrlPhoto() != null ? category.getUrlPhoto() : "";

        int minAge = category.getAgeRange() != null && category.getAgeRange().minAge() != 0
                ? category.getAgeRange().minAge()
                : 0;
        int maxAge = category.getAgeRange() != null && category.getAgeRange().maxAge() != 0
                ? category.getAgeRange().maxAge()
                : 0;

        return new CategoryInfoRecord(
                category.getId(),
                name,
                imageUrl,
                new AgeRangeRecord(minAge, maxAge)
        );
    }

    public Set<CategoryInfoRecord> categoryListToCategoryInfoRecordSet(List<Category> categories) {
        if (categories == null) {
            return Set.of(); // Return an empty set if the input is null
        }

        return categories.stream()
                .map(this::categoryToCategoryInfoRecord)
                .collect(Collectors.toSet());
    }

    public Category categoryInfoRecordToCategory(CategoryInfoRecord record) {
        if (record == null) {
            return null;
        }

        String name = record.name() != null ? record.name() : "";
        String imageUrl = record.imageUrl() != null ? record.imageUrl() : "";

        int minAge = record.ageRange() != null && record.ageRange().minAge() != 0
                ? record.ageRange().minAge()
                : 0;
        int maxAge = record.ageRange() != null && record.ageRange().maxAge() != 0
                ? record.ageRange().maxAge()
                : 0;

        return Category.builder()
                .id(record.id())
                .urlPhoto(imageUrl)
                .name(new CategoryName(name))
                .ageRange(new AgeRange(minAge, maxAge))
                .teams(new HashSet<>())
                .build();
    }
}
