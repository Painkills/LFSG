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

    public Iterable<Note> getAllNotes(){
        try {
            return noteRepo.findAll();
        } catch (Exception e) {
            return null;
        }
    }

    public ByteArrayOutputStream makePDF() throws BadElementException, IOException {
        // Query MongoDB to retrieve the documents you want to include in the PDF file
        Iterable<Note> notes = noteRepo.findByOrderByLabelAsc();
        String UncialAntiqua = "server\\src\\main\\resources\\fonts\\UncialAntiqua-Regular.ttf";

        // Create a new PDF document
        return pdfUtil.createPDF(notes);
    }
}
