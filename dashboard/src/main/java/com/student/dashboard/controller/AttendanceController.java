package com.student.dashboard.controller;

import com.student.dashboard.dto.AttendanceRecordResponse;
import com.student.dashboard.dto.AttendanceRequest;
import com.student.dashboard.dto.AttendanceSummaryResponse;
import com.student.dashboard.dto.BulkAttendanceDateRequest;
import com.student.dashboard.dto.DailyAttendanceStudentResponse;
import com.student.dashboard.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AttendanceRecordResponse createAttendance(@Valid @RequestBody AttendanceRequest request) {
        return new AttendanceRecordResponse(attendanceService.createAttendance(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AttendanceRecordResponse updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        return new AttendanceRecordResponse(attendanceService.updateAttendance(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
    }

    @GetMapping("/student/{studentId}")
    public List<AttendanceRecordResponse> getAttendanceByStudent(@PathVariable Long studentId) {
        return attendanceService.getAttendanceForStudent(studentId).stream()
                .map(AttendanceRecordResponse::new)
                .toList();
    }

    @GetMapping("/student/{studentId}/month")
    public List<AttendanceRecordResponse> getAttendanceByMonth(
            @PathVariable Long studentId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return attendanceService.getMonthlyAttendance(studentId, year, month).stream()
                .map(AttendanceRecordResponse::new)
                .toList();
    }

    @GetMapping("/student/{studentId}/summary")
    public AttendanceSummaryResponse getAttendanceSummary(@PathVariable Long studentId) {
        return attendanceService.getAttendanceSummary(studentId);
    }

    @GetMapping("/date/{attendanceDate}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<DailyAttendanceStudentResponse> getAttendanceByDate(@PathVariable LocalDate attendanceDate) {
        return attendanceService.getAttendanceForDate(attendanceDate);
    }

    @PostMapping("/date")
    @PreAuthorize("hasRole('ADMIN')")
    public List<DailyAttendanceStudentResponse> saveAttendanceByDate(@Valid @RequestBody BulkAttendanceDateRequest request) {
        return attendanceService.saveAttendanceForDate(request);
    }
}
