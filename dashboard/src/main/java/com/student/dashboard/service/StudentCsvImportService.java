package com.student.dashboard.service;

import com.student.dashboard.dto.StudentImportResponse;
import com.student.dashboard.entity.Student;
import com.student.dashboard.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class StudentCsvImportService {

    private final StudentRepository studentRepository;

    public StudentCsvImportService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public StudentImportResponse importCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please upload a CSV file");
        }

        String filename = file.getOriginalFilename();
        if (filename != null && !filename.toLowerCase().endsWith(".csv")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only CSV files are supported");
        }

        int createdCount = 0;
        int updatedCount = 0;
        List<Student> studentsToSave = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                String trimmedLine = normalizeLine(line);

                if (trimmedLine.isEmpty()) {
                    continue;
                }

                if (lineNumber == 1 && isHeaderRow(trimmedLine)) {
                    continue;
                }

                String[] columns = parseColumns(trimmedLine);
                if (columns.length < 4) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Invalid CSV format at line " + lineNumber + ". Expected: id,name,branch,studentYear"
                    );
                }

                Long studentId = parseStudentId(columns[0], lineNumber);
                String name = requireValue(columns[1], "name", lineNumber);
                String branch = requireValue(columns[2], "branch", lineNumber);
                int studentYear = parseStudentYear(columns[3], lineNumber);

                Student student = studentRepository.findById(studentId).orElseGet(Student::new);
                boolean isNewStudent = student.getId() == null;

                student.setId(studentId);
                student.setName(name);
                student.setBranch(branch);
                student.setStudentYear(studentYear);
                if (student.getAttendancePercentage() == null) {
                    student.setAttendancePercentage(0.0);
                }

                studentsToSave.add(student);
                if (isNewStudent) {
                    createdCount++;
                } else {
                    updatedCount++;
                }
            }

        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read CSV file");
        }

        if (studentsToSave.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV file does not contain any student rows");
        }

        try {
            studentRepository.saveAll(studentsToSave);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to import CSV data. Verify ids are unique numbers and year is between 1 and 4."
            );
        }

        int importedCount = createdCount + updatedCount;
        String message = "Imported " + importedCount + " students";
        return new StudentImportResponse(importedCount, createdCount, updatedCount, message);
    }

    private boolean isHeaderRow(String line) {
        String[] columns = parseColumns(line);
        if (columns.length < 4) {
            return false;
        }

        return "id".equalsIgnoreCase(columns[0].trim())
                && "name".equalsIgnoreCase(columns[1].trim())
                && "branch".equalsIgnoreCase(columns[2].trim())
                && "studentyear".equalsIgnoreCase(columns[3].trim());
    }

    private Long parseStudentId(String rawValue, int lineNumber) {
        try {
            return Long.parseLong(rawValue.trim());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid student id at line " + lineNumber);
        }
    }

    private int parseStudentYear(String rawValue, int lineNumber) {
        try {
            int value = Integer.parseInt(rawValue.trim());
            if (value < 1 || value > 4) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student year must be between 1 and 4 at line " + lineNumber);
            }
            return value;
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid student year at line " + lineNumber);
        }
    }

    private String requireValue(String rawValue, String fieldName, int lineNumber) {
        String value = rawValue == null ? "" : rawValue.trim();
        if (value.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing " + fieldName + " at line " + lineNumber);
        }
        return value;
    }

    private String normalizeLine(String line) {
        if (line == null) {
            return "";
        }

        String normalized = line.trim();
        if (!normalized.isEmpty() && normalized.charAt(0) == '\uFEFF') {
            normalized = normalized.substring(1).trim();
        }
        return normalized;
    }

    private String[] parseColumns(String line) {
        List<String> columns = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int index = 0; index < line.length(); index++) {
            char currentChar = line.charAt(index);
            if (currentChar == '"') {
                if (inQuotes && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    current.append('"');
                    index++;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (currentChar == ',' && !inQuotes) {
                columns.add(current.toString().trim());
                current.setLength(0);
                continue;
            }

            current.append(currentChar);
        }

        columns.add(current.toString().trim());
        return columns.stream()
                .map(this::stripWrappingQuotes)
                .toArray(String[]::new);
    }

    private String stripWrappingQuotes(String value) {
        if (value == null || value.length() < 2) {
            return value;
        }

        if (value.startsWith("\"") && value.endsWith("\"")) {
            return value.substring(1, value.length() - 1).trim();
        }

        return value;
    }
}
