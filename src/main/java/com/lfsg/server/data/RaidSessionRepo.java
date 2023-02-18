package com.lfsg.server.data;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface RaidSessionRepo extends MongoRepository<RaidSession, String> {
}
