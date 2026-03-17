package com.student.dashboard.repository;

import com.student.dashboard.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findAllByStudentIdOrderByAttendanceDateDesc(Long studentId);

    List<AttendanceRecord> findAllByAttendanceDate(LocalDate attendanceDate);

    List<AttendanceRecord> findAllByStudentIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(
            Long studentId,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<AttendanceRecord> findByStudentIdAndAttendanceDate(Long studentId, LocalDate attendanceDate);
}
