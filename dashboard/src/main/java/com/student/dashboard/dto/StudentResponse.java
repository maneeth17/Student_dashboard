package com.student.dashboard.dto;

import com.student.dashboard.entity.Student;

public class StudentResponse {
    private final Long id;
    private final String name;
    private final String branch;
    private final int studentYear;
    private final double attendancePercentage;
    private final int totalMarkedDays;
    private final int presentDays;
    private final int absentDays;
    private final int lateDays;
    private final int leaveDays;

    public StudentResponse(Student student, AttendanceSummaryResponse summary) {
        this.id = student.getId();
        this.name = student.getName();
        this.branch = student.getBranch();
        this.studentYear = student.getStudentYear();
        this.attendancePercentage = summary.getAttendancePercentage();
        this.totalMarkedDays = summary.getTotalMarkedDays();
        this.presentDays = summary.getPresentDays();
        this.absentDays = summary.getAbsentDays();
        this.lateDays = summary.getLateDays();
        this.leaveDays = summary.getLeaveDays();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBranch() {
        return branch;
    }

    public int getStudentYear() {
        return studentYear;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public int getTotalMarkedDays() {
        return totalMarkedDays;
    }

    public int getPresentDays() {
        return presentDays;
    }

    public int getAbsentDays() {
        return absentDays;
    }

    public int getLateDays() {
        return lateDays;
    }

    public int getLeaveDays() {
        return leaveDays;
    }
}
