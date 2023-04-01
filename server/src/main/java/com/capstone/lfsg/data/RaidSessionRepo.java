package com.capstone.lfsg.data;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface RaidSessionRepo extends MongoRepository<RaidSession, String> {
    List<RaidSession> findByStudentIdListContains(String studentId);

    @Query("{ '_id' : ?0 }")
    void addStudent(String id, String studentId);

    @Query("{ '_id' : ?0 }")
    void removeStudent(String id, String studentId);

    @Query("{ '_id' : ?0 }")
    void addRoom(String id, String roomId);

    @Query("{ '_id' : ?0 }")
    void addDomain(String id, String domain);

    @Query("{ '_id' : ?0 }")
    void removeDomain(String id, String domain);
}
