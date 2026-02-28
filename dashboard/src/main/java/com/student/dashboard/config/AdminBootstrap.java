package com.student.dashboard.config;

import com.student.dashboard.entity.Role;
import com.student.dashboard.entity.User;
import com.student.dashboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${APP_ADMIN_USERNAME:admin}")
    private String adminUsername;

    @Value("${APP_ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    public AdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        User admin = userRepository.findByUsername(adminUsername);
        if (admin == null) {
            admin = new User();
            admin.setUsername(adminUsername);
        }

        admin.setRole(Role.ADMIN);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        userRepository.save(admin);
    }
}
