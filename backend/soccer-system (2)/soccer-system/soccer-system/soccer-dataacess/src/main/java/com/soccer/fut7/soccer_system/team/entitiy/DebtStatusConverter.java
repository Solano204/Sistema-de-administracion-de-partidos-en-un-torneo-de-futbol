package com.soccer.fut7.soccer_system.team.entitiy;
import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.type.SqlTypes;
import org.hibernate.usertype.UserType;

import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;


import com.soccer.fut7.soccer_system.ValueObject.DebtStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DebtStatusConverter implements AttributeConverter<DebtStatus, String> {

    @Override
    public String convertToDatabaseColumn(DebtStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public DebtStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return DebtStatus.valueOf(dbData);
    }
}