package com.soccer.fut7.soccer_system.team.mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public abstract class BaseMapper {
    
    @Autowired
    protected ApplicationContext applicationContext;
    
    // Helper method to get mappers lazily when needed
    protected <T> T getMapper(Class<T> mapperClass) {
        return applicationContext.getBean(mapperClass);
    }
}