package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.data.NoteRepo;
import com.capstone.lfsg.data.RaidSession;
import com.capstone.lfsg.data.RaidSessionRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class RaidSessionService {

    private final RaidSessionRepo raidSessionRepo;

    public RaidSessionService(RaidSessionRepo raidSessionRepo) {
        this.raidSessionRepo = raidSessionRepo;
    }

    public void saveRaidSession(RaidSession session) {
        try {
            session.setCreatedAt(LocalDateTime.now());
            raidSessionRepo.save(session);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    public Iterable<RaidSession> getAllRaidSessions(){
        try {
            return raidSessionRepo.findAll();
        } catch (Exception e) {
            return null;
        }
    }
}
