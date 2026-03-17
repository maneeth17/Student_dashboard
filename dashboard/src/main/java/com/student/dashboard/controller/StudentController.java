package com.student.dashboard.controller;

import com.student.dashboard.dto.StudentImportResponse;
import com.student.dashboard.dto.StudentResponse;
import com.student.dashboard.entity.Student;
import com.student.dashboard.repository.StudentRepository;
import com.student.dashboard.service.AttendanceService;
import com.student.dashboard.service.StudentCsvImportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository repository;
    private final AttendanceService attendanceService;
    private final StudentCsvImportService studentCsvImportService;

    public StudentController(
            StudentRepository repository,
            AttendanceService attendanceService,
            StudentCsvImportService studentCsvImportService
    ) {
        this.repository = repository;
        this.attendanceService = attendanceService;
        this.studentCsvImportService = studentCsvImportService;
    }

    // GET all students
    @GetMapping
    public List<StudentResponse> getAllStudents() {
        return repository.findAll().stream()
                .map(student -> new StudentResponse(student, attendanceService.buildSummary(student)))
                .collect(Collectors.toList());
    }

    // GET student by id
    @GetMapping("/{id}")
    public StudentResponse getStudentById(@PathVariable Long id) {
        Student student = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        return new StudentResponse(student, attendanceService.buildSummary(student));
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
        if (student.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required");
        }
        student.setAttendancePercentage(0.0);
        return repository.save(student);
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public StudentImportResponse importStudents(@RequestParam("file") MultipartFile file) {
        return studentCsvImportService.importCsv(file);
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

        return repository.save(student);
    }

    // DELETE student (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteStudent(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
