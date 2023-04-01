package com.capstone.lfsg.web;

import com.capstone.lfsg.data.RaidSession;
import com.capstone.lfsg.service.RaidSessionService;
import com.capstone.lfsg.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
public class RaidSessionController {
    private final RaidSessionService raidService;
    private final StudentService studentService;

    public RaidSessionController(RaidSessionService raidService, StudentService studentService) {
        this.raidService = raidService;
        this.studentService = studentService;
    }

    @PostMapping("/add")
    public ResponseEntity<String> addRaidSession(RaidSession raidSession) {
        raidService.createRaidSession(raidSession);
        return ResponseEntity.ok("Raid Session Created");
    }

    @PostMapping("/{raidSession}/addRoom")
    public void addRoomToSession(@PathVariable String raidSession) {
        Boolean success = raidService.addRaidRoomToSession(raidSession);
        // TODO: get frontend to reload data now that a new raidSession exists
    }

    @PostMapping("/getAll")
    public ResponseEntity<List<RaidSession>> getAllRaidSessions() {
        List<RaidSession> raidSessionList = raidService.getAllRaidSessions();
        return ResponseEntity.ok(raidSessionList);
    }

    @PostMapping("/getSessions/{studentId}")
    public ResponseEntity<List<RaidSession>> getStudentRaidSessions(@PathVariable String studentId) {
        List<RaidSession> raidSessionList = raidService.getRaidSessionsByStudent(studentId);
        return ResponseEntity.ok(raidSessionList);
    }

    @PostMapping("/{raidSession}/addStudent/{studentId}")
    public ResponseEntity<String> addStudentToRaidSession(@PathVariable String raidSession,
                                                          @PathVariable String studentId) {
        raidService.addStudentToRaidSession(raidSession, studentId);
        return ResponseEntity.ok("Student added");
        // TODO: perhaps reroute to updated student list?
    }
}
