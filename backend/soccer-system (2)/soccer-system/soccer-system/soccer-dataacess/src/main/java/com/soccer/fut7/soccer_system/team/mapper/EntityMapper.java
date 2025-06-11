package com.soccer.fut7.soccer_system.team.mapper;

import java.util.UUID;

public interface EntityMapper<D, E> {
    E toEntity(D domain);
    D toDomain(E entity);
    
    // Optional methods with default implementations
    default E UUIDtoEntity(UUID id) {
        return null; // Override in specific mappers that need this
    }
}