package com.soccer.fut7.soccer_system.EntityApplication;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.AgeRange;
import com.soccer.fut7.soccer_system.ValueObject.CategoryDescription;
import com.soccer.fut7.soccer_system.ValueObject.CategoryName;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category extends AggregateRoot {
    private UUID id;
    private CategoryName name;
    private AgeRange ageRange;
    private String urlPhoto;
    private Set<Team> teams;
}