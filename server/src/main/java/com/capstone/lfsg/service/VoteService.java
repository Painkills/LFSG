package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Vote;
import com.capstone.lfsg.data.VoteRepo;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class VoteService {
    private final VoteRepo voteRepo;

    public VoteService(VoteRepo voteRepo) {
        this.voteRepo = voteRepo;
    }

    public Vote handleVote(Vote vote) {
        // check if another vote exists with the label given for that student
        try {
            Vote existingVote = voteRepo.findByRoomAndStudentIdAndLabel(vote.getRoom(), vote.getStudentId(), vote.getLabel())
                    .orElseThrow(() -> new Exception("Vote not found."));

            // save the current one
            voteRepo.save(vote);

            // delete the old one
            voteRepo.delete(existingVote);

            // return the previous one for removal of "upvote" sign on client
            return existingVote;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }
}
