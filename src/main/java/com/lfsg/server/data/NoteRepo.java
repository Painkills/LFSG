package com.lfsg.server.data;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NoteRepo extends MongoRepository<Note, String> {
    Iterable<Note> findByOrderByLabelAsc();
}