package com.soccer.fut7.soccer_system.rest.ServiceSecurity;


import lombok.AllArgsConstructor;

import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.soccer.fut7.soccer_system.Configuration.JwtProperties;
import com.soccer.fut7.soccer_system.rest.ExceptionHandlers.JwtAuthenticationEntryPoint;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {



    private final JwtProperties jwtProperties;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(JwtProperties jwtProperties, JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtProperties = jwtProperties;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    

    private  JwtAuthenticationFilter jwtAuthenticationFilter;



    @Autowired
    public void setJwtAuthenticationFilter(@org.springframework.context.annotation.Lazy JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exceptions -> 
                exceptions.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // CRITICAL FIX: this used to permitAll() the entire "/users/**"
                // and "/auth/**" trees. That made every UserController endpoint
                // (list all users, change any user's status, delete any user,
                // update any user's details/photo, fetch any user's details) and
                // AuthController's PUT /auth/change-password/admin - which resets
                // ANY username's password to any value with NO current-password
                // check - reachable by anyone on the internet with no token at
                // all. Narrowed to exactly the endpoints that have a genuine
                // reason to be public: logging in, refreshing a token, and
                // POST /users (self-registration - see CommandHelperUser.
                // insertUser's own "Admin already exist" bootstrap check, which
                // only self-limits the ADMINISTRADOR role to a one-time initial
                // signup, not a reason to leave every other user-management
                // endpoint open). Method-level @PreAuthorize was also added to
                // the affected controllers as defense in depth, matching
                // @EnableMethodSecurity already being active on this class.
                .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/refresh").permitAll()
                .requestMatchers(HttpMethod.POST, "/users").permitAll()
                .requestMatchers(HttpMethod.GET, "/users/exist-admin").permitAll()
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/actuator/health"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

   @Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Safely handle null allowedOrigins
    if (jwtProperties.getAllowedOrigins() != null) {
        // Remove any "*" values if credentials are allowed
        List<String> origins = Arrays.asList(jwtProperties.getAllowedOrigins());
        origins = origins.stream()
                .filter(origin -> !origin.equals("*"))
                .collect(Collectors.toList());
        
        if (origins.isEmpty()) {
            // If no valid origins left, don't set any (or set your fallback)
            configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // Fallback
        } else {
            configuration.setAllowedOrigins(origins);
        }
    } else {
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // Fallback
    }
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Auth-Token"));
    configuration.setExposedHeaders(List.of("X-Auth-Token"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}