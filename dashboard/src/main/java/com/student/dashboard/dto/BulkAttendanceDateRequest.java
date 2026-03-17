package com.student.dashboard.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class BulkAttendanceDateRequest {

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @Valid
    @NotEmpty(message = "Attendance entries are required")
    private List<BulkAttendanceItemRequest> entries;

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public List<BulkAttendanceItemRequest> getEntries() {
        return entries;
    }

    public void setEntries(List<BulkAttendanceItemRequest> entries) {
        this.entries = entries;
    }
}
