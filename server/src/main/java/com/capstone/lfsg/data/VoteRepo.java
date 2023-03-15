package com.capstone.lfsg.data;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VoteRepo extends MongoRepository<Vote, String> {
    Optional<Vote> findByRoomAndStudentIdAndLabel(String room, String studentId, String label);
}
