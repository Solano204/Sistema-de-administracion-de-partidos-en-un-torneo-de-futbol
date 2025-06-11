package com.soccer.fut7.soccer_system.main;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.soccer.fut7.soccer_system")
@EnableJpaRepositories(basePackages = "com.soccer.fut7.soccer_system.team.repository")
@EntityScan(basePackages = "com.soccer.fut7.soccer_system.team.entitiy")
public class SoccerSystemApplication {
	public static void main(String[] args) {
		SpringApplication.run(SoccerSystemApplication.class, args);
	}

}
// mvn clean install -DskipTests docker build --no-cache -t fut-backend .