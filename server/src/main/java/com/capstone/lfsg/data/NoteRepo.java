package com.capstone.lfsg.data;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NoteRepo extends MongoRepository<Note, String> {
    Iterable<Note> findByRoomIdOrderByGoldDesc(String room);
    Iterable<Note> findByRoomId(String room);
}