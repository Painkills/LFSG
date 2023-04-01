package com.capstone.lfsg.web;

import com.capstone.lfsg.service.RaidSessionService;
import com.capstone.lfsg.service.StudentService;

public class RaidController {
    private final RaidSessionService raidService;
    private final StudentService studentService;

    public RaidController(RaidSessionService raidService, StudentService studentService) {
        this.raidService = raidService;
        this.studentService = studentService;
    }


}
