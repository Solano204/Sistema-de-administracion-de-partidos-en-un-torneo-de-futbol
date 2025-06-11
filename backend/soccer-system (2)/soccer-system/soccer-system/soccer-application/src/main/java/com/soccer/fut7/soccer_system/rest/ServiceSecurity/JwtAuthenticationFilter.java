
package com.soccer.fut7.soccer_system.rest.ServiceSecurity;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;    
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.soccer.fut7.soccer_system.Configuration.JwtProperties;
import com.soccer.fut7.soccer_system.ports.input.service.UserApplicationService;

import java.io.IOException;


// Here validate the Token
@Component
@AllArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);


    @Lazy
    private final UserApplicationService userApplicationService;
    


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) 
            throws ServletException, IOException {
        try {
            userApplicationService.DoFilter(request, response);
            filterChain.doFilter(request, response);
        } catch (JwtException e) {
            // Exception already handled by handleJwtAuthenticationWithResponse
            return;
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
        }
    }
}