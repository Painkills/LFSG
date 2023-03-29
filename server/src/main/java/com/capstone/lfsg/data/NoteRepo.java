package com.capstone.lfsg.data;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface NoteRepo extends MongoRepository<Note, String> {
    Iterable<Note> findByOrderByCreatedAt();
    Iterable<Note> findByRoomId(String room);
}