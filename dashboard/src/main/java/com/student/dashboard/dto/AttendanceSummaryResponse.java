package com.student.dashboard.dto;

public class AttendanceSummaryResponse {
    private final Long studentId;
    private final int totalMarkedDays;
    private final int presentDays;
    private final int absentDays;
    private final int lateDays;
    private final int leaveDays;
    private final double attendancePercentage;

    public AttendanceSummaryResponse(
            Long studentId,
            int totalMarkedDays,
            int presentDays,
            int absentDays,
            int lateDays,
            int leaveDays,
            double attendancePercentage
    ) {
        this.studentId = studentId;
        this.totalMarkedDays = totalMarkedDays;
        this.presentDays = presentDays;
        this.absentDays = absentDays;
        this.lateDays = lateDays;
        this.leaveDays = leaveDays;
        this.attendancePercentage = attendancePercentage;
    }

    public Long getStudentId() {
        return studentId;
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

    public double getAttendancePercentage() {
        return attendancePercentage;
    }
}
