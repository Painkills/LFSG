package com.capstone.lfsg.service;

import com.capstone.lfsg.data.*;
import com.capstone.lfsg.utils.PdfUtil;
import com.itextpdf.text.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
public class RaidRoomService {
    private final NoteRepo noteRepo;
    private final VoteRepo voteRepo;
    private final StudentRepo studentRepo;
    private final PdfUtil pdfUtil;

    public RaidRoomService(NoteRepo noteRepo, VoteRepo voteRepo, StudentRepo studentRepo, PdfUtil pdfUtil) {
        this.noteRepo = noteRepo;
        this.voteRepo = voteRepo;
        this.studentRepo = studentRepo;
        this.pdfUtil = pdfUtil;
    }

    public void saveNote(Note note) {
        note.setCreatedAt(LocalDateTime.now());
        noteRepo.save(note);
    }

    public Note labelNote(String id, String label, String labelerId) {
        Note existingNote = noteRepo.findById(id).orElseThrow();
        existingNote.setLabel(label);
        noteRepo.save(existingNote);

        try{
            // Get gold for labeling
            Student student = studentRepo.findById(labelerId).orElseThrow();
            student.setGold(student.getGold() + 1);
            studentRepo.save(student);
        } catch (Exception e) {
            System.out.println(e);
        }

        return existingNote;
    }

    public List<Note> getAllNotesByRoom(String room){
        try {
            return noteRepo.findByRoomId(room);
        } catch (Exception e) {
            return null;
        }
    }

    public ByteArrayOutputStream makePDF(String room) throws BadElementException, IOException {
        // Get all notes for each label, ordered by gold
        List<Note> filteredNotes = noteRepo.findByRoomIdOrderByLabelAscGoldDesc(room);

        // Create a new PDF document
        return pdfUtil.createPDF(filteredNotes);
    }

    public List<Note> handleVote(String userName, Note note) {
        List<Note> modifiedNotes = new ArrayList<>();

        Vote vote = new Vote();
        vote.setStudentId(userName);
        vote.setLabel(note.getLabel());
        vote.setNoteId(note.getId());
        vote.setRoomId(note.getRoomId());

        // if there is already a vote by this student within this label, replace it
        if (voteRepo.existsByRoomIdAndStudentIdAndLabel(vote.getRoomId(), vote.getStudentId(), vote.getLabel())) {
            try {
                Vote existingVote = voteRepo.findByRoomIdAndStudentIdAndLabel(vote.getRoomId(), vote.getStudentId(), vote.getLabel())
                        .orElseThrow(() -> new Exception("Vote not found."));

                // add gold to currently voted note
                note.setGold(note.getGold() + 1);
                noteRepo.save(note);
                modifiedNotes.add(note);

                // save the new vote
                voteRepo.save(vote);

                // remove gold from previously voted note
                Note oldNote = noteRepo.findById(existingVote.getNoteId())
                        .orElseThrow(() -> new Exception("Note not found"));
                oldNote.setGold(oldNote.getGold() - 1);
                noteRepo.save(oldNote);
                modifiedNotes.add(oldNote);

                // delete the old one
                voteRepo.delete(existingVote);

                // return the noteId that has to have gold removed
                return modifiedNotes;

            } catch (Exception e) {
                return null;
            }
            // if the vote is unique, save it
        } else {
            // save the current one
            voteRepo.save(vote);
            note.setGold(note.getGold() + 1);
            noteRepo.save(note);
            modifiedNotes.add(note);

            return modifiedNotes;
        }
    }

    public void awardGold(String roomId) {
        List<Vote> roomVotes = voteRepo.findAllByRoomIdOrderByStudentId(roomId);
        roomVotes.forEach((vote) -> {
            Note votedNote = noteRepo.findById(vote.getNoteId()).orElseThrow();
            Student student = studentRepo.findById(votedNote.getSenderName()).orElseThrow();
            student.setGold(student.getGold() + 1);
            studentRepo.save(student);
        });
    }
}
