package com.soccer.fut7.soccer_system.ValueObject;
public record UserCredentials(String username, String passwordHash) {


    public static UserCredentials of(String username, String passwordHash) {
        return new UserCredentials(username, passwordHash);
    }
}