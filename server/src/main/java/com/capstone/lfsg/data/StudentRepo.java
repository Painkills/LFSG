package com.capstone.lfsg.data;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepo extends MongoRepository<Student, String> {
    Iterable<Student> findStudentsByFirstNameContains(@Param("firstName") String firstName);
    Optional<Student> findByEmail(String email);
}
