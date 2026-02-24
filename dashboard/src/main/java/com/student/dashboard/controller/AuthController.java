package com.student.dashboard.controller;

import com.student.dashboard.dto.AuthRequest;
import com.student.dashboard.dto.AuthResponse;
import com.student.dashboard.entity.Role;
import com.student.dashboard.entity.User;
import com.student.dashboard.repository.UserRepository;
import com.student.dashboard.security.CustomUserDetailsService;
import com.student.dashboard.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    // REGISTER + ISSUE TOKEN
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {

        User existingUser = userRepository.findByUsername(request.getUsername());

        if (existingUser != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails, user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getUsername()));
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        User existingUser = userRepository.findByUsername(request.getUsername());
        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("INVALID");
        }

        String storedPassword = existingUser.getPassword();
        boolean validPassword = storedPassword != null && passwordEncoder.matches(request.getPassword(), storedPassword);

        // Backward compatibility: migrate legacy plaintext passwords to BCrypt on successful login.
        if (!validPassword && storedPassword != null && storedPassword.equals(request.getPassword())) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(existingUser);
            validPassword = true;
        }

        if (!validPassword) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("INVALID");
        }

        String role = existingUser.getRole() == null ? Role.STUDENT.name() : existingUser.getRole().name();
        UserDetails userDetails = userDetailsService.loadUserByUsername(existingUser.getUsername());
        String token = jwtService.generateToken(userDetails, role);
        return ResponseEntity.ok(new AuthResponse(token, role, existingUser.getUsername()));
    }
}
