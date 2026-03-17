package com.student.dashboard.dto;

import com.student.dashboard.entity.AttendanceRecord;
import com.student.dashboard.entity.AttendanceStatus;
import com.student.dashboard.entity.Student;

public class DailyAttendanceStudentResponse {

    private final Long recordId;
    private final Long studentId;
    private final String studentName;
    private final String branch;
    private final int studentYear;
    private final AttendanceStatus status;
    private final String remarks;

    public DailyAttendanceStudentResponse(Student student, AttendanceRecord record) {
        this.recordId = record == null ? null : record.getId();
        this.studentId = student.getId();
        this.studentName = student.getName();
        this.branch = student.getBranch();
        this.studentYear = student.getStudentYear();
        this.status = record == null ? null : record.getStatus();
        this.remarks = record == null ? null : record.getRemarks();
    }

    public Long getRecordId() {
        return recordId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getBranch() {
        return branch;
    }

    public int getStudentYear() {
        return studentYear;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public String getRemarks() {
        return remarks;
    }
}
