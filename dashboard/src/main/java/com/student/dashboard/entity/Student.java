package com.student.dashboard.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "students")
public class Student {

    @Id
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Branch is required")
    private String branch;

    @Column(name = "student_year")
    @Min(value = 1, message = "Year must be at least 1")
    @Max(value = 4, message = "Year must be at most 4")
    private int studentYear;

    @Column(name = "attendance_percentage")
    private Double attendancePercentage = 0.0;

    public Student() {}

    public Student(String name, String branch, int studentYear) {
        this.name = name;
        this.branch = branch;
        this.studentYear = studentYear;
        this.attendancePercentage = 0.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }

    public int getStudentYear() { return studentYear; }
    public void setStudentYear(int studentYear) { this.studentYear = studentYear; }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }
}
