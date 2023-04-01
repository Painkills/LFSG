package com.capstone.lfsg.service;

import com.capstone.lfsg.data.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RaidSessionService {

    private final RaidSessionRepo raidSessionRepo;
    private final StudentService studentService;

    public RaidSessionService(RaidSessionRepo raidSessionRepo, StudentService studentService) {
        this.raidSessionRepo = raidSessionRepo;
        this.studentService = studentService;
    }

    public static String generateId() {
        UUID id = UUID.randomUUID();
        return id.toString();
    }

    public void createRaidSession(RaidSession raid) {
        raidSessionRepo.save(raid);
    }

    public boolean addRaidRoom(String raidSessionId) {
        try {
            RaidSession raid = raidSessionRepo.findById(raidSessionId)
                    .orElseThrow(() -> new Exception("Note not found with ID: " + raidSessionId));

            String newRoomId = generateId();
            raid.addRoom(newRoomId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public List<RaidSession> getAllRaidSessions(){
        return raidSessionRepo.findAll();
    }

    public List<RaidSession> getRaidSessionsByStudent(String studentId) {
        return raidSessionRepo.findByStudentIdListContains(studentId);
    }

    public boolean addStudentToRaidSession(String raidSessionId, String studentId) {
        try {
            RaidSession raid = raidSessionRepo.findById(raidSessionId)
                    .orElseThrow(() -> new Exception("Note not found with ID: " + raidSessionId));

            if (authenticateStudent(raid)) {
                raid.addStudent(studentId);
                return true;
            }
            return false;

        } catch (Exception e) {
            return false;
        }
    }

    public boolean authenticateStudent(RaidSession raid) {
        // check if student email matches raidSession authorized domains.
        return true;
    }
}
