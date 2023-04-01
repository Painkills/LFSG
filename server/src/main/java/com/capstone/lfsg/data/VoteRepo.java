package com.capstone.lfsg.data;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VoteRepo extends MongoRepository<Vote, String> {
    Optional<Vote> findByRoomIdAndStudentIdAndLabel(String room, String studentId, String label);
    Boolean existsByRoomIdAndStudentIdAndLabel(String room, String studentId, String label);
}
