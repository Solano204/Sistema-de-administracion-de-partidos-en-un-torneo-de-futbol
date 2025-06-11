package com.soccer.fut7.soccer_system.EntityApplication;
import com.soccer.fut7.soccer_system.ValueObject.BirthDate;
import com.soccer.fut7.soccer_system.ValueObject.PersonName;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class Person extends AggregateRoot {
    private PersonName personName;
    private BirthDate birthDate;
    private Integer age;
    
    
    protected void calculateAge() {
        if (birthDate != null) {
            this.age = birthDate.calculateAge();
        }
    }
}