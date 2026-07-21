package com.soccer.fut7.soccer_system;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// classes= is required here: SoccerSystemApplication lives in a CHILD package
// (com.soccer.fut7.soccer_system.main), not this test's own package or a parent of it, so
// @SpringBootTest's default upward-package-scan for a @SpringBootConfiguration never finds it.
@SpringBootTest(classes = com.soccer.fut7.soccer_system.main.SoccerSystemApplication.class)
class SoccerSystemApplicationTests {

	@Test
	void contextLoads() {
	}

}
