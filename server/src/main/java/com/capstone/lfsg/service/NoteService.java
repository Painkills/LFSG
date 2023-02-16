package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.data.NoteRepo;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class NoteService {
    private final NoteRepo noteRepo;

    public NoteService(NoteRepo noteRepo) {
        this.noteRepo = noteRepo;
    }

    public boolean saveNote(Note note) {
        try {
            noteRepo.save(note);
            return true;
        } catch (Exception e) {
            System.out.println(e);
            return false;
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

    public Iterable<Note> getAllNotes(){
        try {
            return noteRepo.findAll();
        } catch (Exception e) {
            return null;
        }
    }

}
