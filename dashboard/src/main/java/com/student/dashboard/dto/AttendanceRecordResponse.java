package com.student.dashboard.dto;

import com.student.dashboard.entity.AttendanceRecord;
import com.student.dashboard.entity.AttendanceStatus;

import java.time.LocalDate;

public class AttendanceRecordResponse {
    private final Long id;
    private final Long studentId;
    private final LocalDate attendanceDate;
    private final AttendanceStatus status;
    private final String remarks;

    public AttendanceRecordResponse(AttendanceRecord record) {
        this.id = record.getId();
        this.studentId = record.getStudent().getId();
        this.attendanceDate = record.getAttendanceDate();
        this.status = record.getStatus();
        this.remarks = record.getRemarks();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public String getRemarks() {
        return remarks;
    }
}
