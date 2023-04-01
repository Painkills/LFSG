package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.data.NoteRepo;
import com.capstone.lfsg.data.Vote;
import com.capstone.lfsg.data.VoteRepo;
import com.capstone.lfsg.utils.PdfUtil;
import com.itextpdf.text.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@Service
public class RaidRoomService {
    private final NoteRepo noteRepo;
    private final VoteRepo voteRepo;
    private final PdfUtil pdfUtil;

    public RaidRoomService(NoteRepo noteRepo, VoteRepo voteRepo, PdfUtil pdfUtil) {
        this.noteRepo = noteRepo;
        this.voteRepo = voteRepo;
        this.pdfUtil = pdfUtil;
    }

    public void saveNote(Note note) {
        try {
            note.setCreatedAt(LocalDateTime.now());
            noteRepo.save(note);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    public Note labelNote(String id, String label) {
        try {
            Note existingNote = noteRepo.findById(id).orElseThrow(() -> new Exception("Note not found with ID: " + id));
            existingNote.setLabel(label);
            noteRepo.save(existingNote);
            return existingNote;
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

//    public List<Note> upvoteNote(noteId)

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
                System.out.println(e);
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
}
