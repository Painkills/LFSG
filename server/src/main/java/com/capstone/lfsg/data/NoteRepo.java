package com.capstone.lfsg.data;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface NoteRepo extends MongoRepository<Note, String> {
    List<Note> findByRoomId(String room);
    List<Note> findByRoomIdOrderByLabelAscGoldDesc(String roomId);
}