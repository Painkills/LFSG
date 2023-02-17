package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.data.NoteRepo;
import com.itextpdf.text.Document;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NoteService {
    private final NoteRepo noteRepo;

    public NoteService(NoteRepo noteRepo) {
        this.noteRepo = noteRepo;
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

    public void makePDF() {
        // Query MongoDB to retrieve the documents you want to include in the PDF file
        Iterable<Note> notes = noteRepo.findAll();
        System.out.println(notes);

        // Create a new PDF document
        Document pdfDoc = new Document();
        try {
            PdfWriter.getInstance(pdfDoc, new FileOutputStream("output.pdf"));
            pdfDoc.open();

            // Iterate through the documents and generate a new page for each one
            for (Note note : notes) {
                // Create a new page
//                pdfDoc.newPage();

                // Add content to the page
                PdfPTable table = new PdfPTable(2);
                table.addCell("Label");
                table.addCell(note.getLabel());
                table.addCell("Written By:");
                table.addCell(note.getSenderName());
                table.addCell("Note");
                table.addCell(note.getMessage());
                table.addCell("Created At:");
                table.addCell(note.getCreatedAt().toString());
                pdfDoc.add(table);
            }

            // Close the PDF document
            pdfDoc.close();
        } catch (Exception e) {
            System.out.println(e);
        }


    }

}
