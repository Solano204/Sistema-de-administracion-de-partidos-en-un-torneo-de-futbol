package com.soccer.fut7.soccer_system;

import org.springframework.boot.autoconfigure.SpringBootApplication;

// soccer-application doesn't depend on soccer-container (where the real
// SoccerSystemApplication lives), so @WebMvcTest's default @SpringBootConfiguration
// auto-detection - which scans upward from the test's own package - has nothing to find.
// This minimal stub sits at the package root so that scan succeeds without pulling in
// the whole application; @WebMvcTest(controllers = ...) still scopes what's actually loaded.
@SpringBootApplication
class TestApplication {
}
