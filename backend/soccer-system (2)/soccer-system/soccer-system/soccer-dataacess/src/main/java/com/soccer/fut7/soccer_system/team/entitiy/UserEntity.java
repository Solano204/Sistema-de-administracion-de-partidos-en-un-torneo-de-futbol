package com.soccer.fut7.soccer_system.team.entitiy;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

import com.soccer.fut7.soccer_system.ValueObject.UserRole;
import com.soccer.fut7.soccer_system.ValueObject.UserStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "users", schema = "fut_jaguar")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name",  length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;


    @Column(name = "age")
    private Integer age = 0;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    @Column(name = "birth_date")
    private LocalDate birthDate;
    @Column(unique = true,  length = 50)
    private String username;

    @Column(name = "password_hash",  length = 255)
    private String passwordHash;

    @Column(name = "user_role")
    private String userRole;


    @Column(name = "email")
    private String email;

    @Column(name = "user_status")
    private String userStatus = UserStatus.ACTIVO.toString();
}
