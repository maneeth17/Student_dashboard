package com.student.dashboard.controller;

import com.student.dashboard.entity.Student;
import com.student.dashboard.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository repository;

    public StudentController(StudentRepository repository) {
        this.repository = repository;
    }

    // GET all students
    @GetMapping
    public List<Student> getAllStudents() {
        return repository.findAll();
    }

    // GET student by id
    @GetMapping("/{id}")
    public Optional<Student> getStudentById(@PathVariable Long id) {
        return repository.findById(id);
    }

    // GET average attendance of all students
    @GetMapping("/average-attendance")
    public Double getAverageAttendance() {

        List<Student> students = repository.findAll();

        if (students.isEmpty()) return 0.0;

        double total = 0;
        int count = 0;

        for (Student s : students) {
            if (s.getAttendancePercentage() != null) {
                total += s.getAttendancePercentage();
                count++;
            }
        }

        return count == 0 ? 0 : total / count;
    }

    // ADD new student (ADMIN only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Student addStudent(@Valid @RequestBody Student student) {
        return repository.save(student);
    }

    // UPDATE student (ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Student updateStudent(@PathVariable Long id, @Valid @RequestBody Student studentDetails) {

        Student student = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        student.setName(studentDetails.getName());
        student.setBranch(studentDetails.getBranch());
        student.setStudentYear(studentDetails.getStudentYear());
        student.setAttendancePercentage(studentDetails.getAttendancePercentage());

        return repository.save(student);
    }

    // DELETE student (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteStudent(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
