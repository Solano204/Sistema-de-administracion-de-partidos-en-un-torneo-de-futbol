package com.soccer.fut7.soccer_system.dto.utility;

import com.soccer.fut7.soccer_system.ValueObject.Points;

public record PointsRecord(int value) {


     public static PointsRecord of(int value) {
        return new PointsRecord(value);
    }
}