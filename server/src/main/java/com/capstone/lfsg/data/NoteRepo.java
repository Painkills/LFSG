package com.capstone.lfsg.data;

import org.springframework.data.domain.Example;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface NoteRepo extends MongoRepository<Note, String> {
}