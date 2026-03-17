package com.student.dashboard.dto;

public class StudentImportResponse {

    private final int importedCount;
    private final int createdCount;
    private final int updatedCount;
    private final String message;

    public StudentImportResponse(int importedCount, int createdCount, int updatedCount, String message) {
        this.importedCount = importedCount;
        this.createdCount = createdCount;
        this.updatedCount = updatedCount;
        this.message = message;
    }

    public int getImportedCount() {
        return importedCount;
    }

    public int getCreatedCount() {
        return createdCount;
    }

    public int getUpdatedCount() {
        return updatedCount;
    }

    public String getMessage() {
        return message;
    }
}
