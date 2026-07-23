package com.soccer.fut7.soccer_system.rest.ServiceSecurity;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

// Adapted from C:\Users\GAMER\Music\BrainTrust\backend's OpenApiConfig pattern
// (same structure: Info + Bearer JWT SecurityScheme applied globally), not
// copied verbatim - title/description/servers are specific to this API.
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "Bearer Authentication";

        return new OpenAPI()
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local development")
                ))
                .info(new Info()
                        .title("Sistema de Administración de Partidos API")
                        .version("0.0.1")
                        .description("""
                                REST API for a 7-a-side soccer tournament management system: \
                                categories, teams, players, referees, matches, tournaments, \
                                inscriptions, debts and referee payments.

                                Auth: JWT Bearer. POST /auth/login to get a token, POST /auth/refresh \
                                to renew it. Only /auth/login, /auth/refresh, POST /users \
                                (self-registration) and GET /users/exist-admin are public - every \
                                other endpoint requires a valid token.""")
                        .contact(new Contact()
                                .name("Sistema Partidos")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste the accessToken returned by POST /auth/login")));
    }
}
