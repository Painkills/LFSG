package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.data.NoteRepo;
import com.capstone.lfsg.utils.PdfUtil;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.DrawInterface;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;


@Service
public class NoteService {
    private final NoteRepo noteRepo;
    private final PdfUtil pdfUtil;

    public NoteService(NoteRepo noteRepo, PdfUtil pdfUtil) {
        this.noteRepo = noteRepo;
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

    public Iterable<Note> getAllNotesByRoom(String room){
        try {
            return noteRepo.findByRoomId(room);
        } catch (Exception e) {
            return null;
        }
    }

    public ByteArrayOutputStream makePDF(String room) throws BadElementException, IOException {
        // Query MongoDB to retrieve the documents you want to include in the PDF file
        Iterable<Note> notes = noteRepo.findByRoomIdOrderByGoldDesc(room);

        // Only get the highest voted note for each category
        List<Note> filteredNotes = new ArrayList<>();
        List<String> labels = new ArrayList<>();
        for (Note note : notes) {
            if (!labels.contains(note.getLabel())) {
                labels.add(note.getLabel());
                filteredNotes.add(note);
            }
        }
        // Create a new PDF document
        return pdfUtil.createPDF(filteredNotes);
    }
}
