package com.student.dashboard.service;

import com.student.dashboard.dto.AttendanceRequest;
import com.student.dashboard.dto.AttendanceSummaryResponse;
import com.student.dashboard.dto.BulkAttendanceDateRequest;
import com.student.dashboard.dto.BulkAttendanceItemRequest;
import com.student.dashboard.dto.DailyAttendanceStudentResponse;
import com.student.dashboard.entity.AttendanceRecord;
import com.student.dashboard.entity.AttendanceStatus;
import com.student.dashboard.entity.Student;
import com.student.dashboard.repository.AttendanceRecordRepository;
import com.student.dashboard.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(AttendanceRecordRepository attendanceRecordRepository, StudentRepository studentRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public AttendanceRecord createAttendance(AttendanceRequest request) {
        Student student = getStudent(request.getStudentId());
        attendanceRecordRepository.findByStudentIdAndAttendanceDate(student.getId(), request.getAttendanceDate())
                .ifPresent(record -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Attendance already marked for this date");
                });

        AttendanceRecord record = new AttendanceRecord();
        applyRequest(record, student, request);
        AttendanceRecord saved = attendanceRecordRepository.save(record);
        syncAttendancePercentage(student);
        return saved;
    }

    @Transactional
    public AttendanceRecord updateAttendance(Long attendanceId, AttendanceRequest request) {
        AttendanceRecord record = attendanceRecordRepository.findById(attendanceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance record not found"));
        Student student = getStudent(request.getStudentId());

        attendanceRecordRepository.findByStudentIdAndAttendanceDate(student.getId(), request.getAttendanceDate())
                .filter(existing -> !existing.getId().equals(attendanceId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Attendance already marked for this date");
                });

        applyRequest(record, student, request);
        AttendanceRecord saved = attendanceRecordRepository.save(record);
        syncAttendancePercentage(student);
        return saved;
    }

    @Transactional
    public void deleteAttendance(Long attendanceId) {
        AttendanceRecord record = attendanceRecordRepository.findById(attendanceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance record not found"));
        Student student = record.getStudent();
        attendanceRecordRepository.delete(record);
        syncAttendancePercentage(student);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getAttendanceForStudent(Long studentId) {
        getStudent(studentId);
        return attendanceRecordRepository.findAllByStudentIdOrderByAttendanceDateDesc(studentId);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecord> getMonthlyAttendance(Long studentId, int year, int month) {
        getStudent(studentId);
        YearMonth yearMonth = YearMonth.of(year, month);
        return attendanceRecordRepository.findAllByStudentIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(
                studentId,
                yearMonth.atDay(1),
                yearMonth.atEndOfMonth()
        );
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getAttendanceSummary(Long studentId) {
        Student student = getStudent(studentId);
        return buildSummary(student);
    }

    @Transactional(readOnly = true)
    public List<DailyAttendanceStudentResponse> getAttendanceForDate(LocalDate attendanceDate) {
        List<Student> students = studentRepository.findAll().stream()
                .sorted(Comparator.comparing(Student::getId))
                .toList();
        Map<Long, AttendanceRecord> recordsByStudentId = attendanceRecordRepository.findAllByAttendanceDate(attendanceDate).stream()
                .collect(Collectors.toMap(record -> record.getStudent().getId(), record -> record));

        return students.stream()
                .map(student -> new DailyAttendanceStudentResponse(student, recordsByStudentId.get(student.getId())))
                .toList();
    }

    @Transactional
    public List<DailyAttendanceStudentResponse> saveAttendanceForDate(BulkAttendanceDateRequest request) {
        Map<Long, Student> studentsById = studentRepository.findAllById(
                        request.getEntries().stream()
                                .map(BulkAttendanceItemRequest::getStudentId)
                                .distinct()
                                .toList()
                ).stream()
                .collect(Collectors.toMap(Student::getId, student -> student));

        Map<Long, AttendanceRecord> existingRecords = attendanceRecordRepository.findAllByAttendanceDate(request.getAttendanceDate()).stream()
                .collect(Collectors.toMap(record -> record.getStudent().getId(), record -> record));

        Map<Long, Student> touchedStudents = new HashMap<>();
        for (BulkAttendanceItemRequest entry : request.getEntries()) {
            Student student = studentsById.get(entry.getStudentId());
            if (student == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found: " + entry.getStudentId());
            }

            AttendanceRecord record = existingRecords.get(student.getId());
            if (record == null) {
                record = new AttendanceRecord();
                record.setStudent(student);
            }

            record.setAttendanceDate(request.getAttendanceDate());
            record.setStatus(entry.getStatus());
            record.setRemarks(normalizeRemarks(entry.getRemarks()));
            AttendanceRecord savedRecord = attendanceRecordRepository.save(record);
            existingRecords.put(student.getId(), savedRecord);
            touchedStudents.put(student.getId(), student);
        }

        for (Student student : touchedStudents.values()) {
            syncAttendancePercentage(student);
        }

        return studentRepository.findAll().stream()
                .sorted(Comparator.comparing(Student::getId))
                .map(student -> new DailyAttendanceStudentResponse(student, existingRecords.get(student.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse buildSummary(Student student) {
        List<AttendanceRecord> records = attendanceRecordRepository.findAllByStudentIdOrderByAttendanceDateDesc(student.getId());
        int presentDays = 0;
        int absentDays = 0;
        int lateDays = 0;
        int leaveDays = 0;

        for (AttendanceRecord record : records) {
            AttendanceStatus status = record.getStatus();
            if (status == AttendanceStatus.PRESENT) {
                presentDays++;
            } else if (status == AttendanceStatus.ABSENT) {
                absentDays++;
            } else if (status == AttendanceStatus.LATE) {
                lateDays++;
            } else if (status == AttendanceStatus.LEAVE) {
                leaveDays++;
            }
        }

        int totalMarkedDays = records.size();
        double attendancePercentage = totalMarkedDays == 0
                ? 0.0
                : ((presentDays + lateDays) * 100.0) / totalMarkedDays;

        return new AttendanceSummaryResponse(
                student.getId(),
                totalMarkedDays,
                presentDays,
                absentDays,
                lateDays,
                leaveDays,
                attendancePercentage
        );
    }

    @Transactional
    public void syncAttendancePercentage(Student student) {
        AttendanceSummaryResponse summary = buildSummary(student);
        student.setAttendancePercentage(summary.getAttendancePercentage());
        studentRepository.save(student);
    }

    private void applyRequest(AttendanceRecord record, Student student, AttendanceRequest request) {
        record.setStudent(student);
        record.setAttendanceDate(request.getAttendanceDate());
        record.setStatus(request.getStatus());
        record.setRemarks(normalizeRemarks(request.getRemarks()));
    }

    private Student getStudent(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private String normalizeRemarks(String remarks) {
        if (remarks == null) {
            return null;
        }

        String normalized = remarks.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
