package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.data.NoteRepo;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;


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

    public ByteArrayOutputStream makePDF() {
        // Query MongoDB to retrieve the documents you want to include in the PDF file
        Iterable<Note> notes = noteRepo.findByOrderByLabelAsc();

        // Create a new PDF document
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document pdfDoc = new Document();
        try {
            // Start PdfWriter
            PdfWriter.getInstance(pdfDoc, out);

            // Open doc
            pdfDoc.open();

            // Set header
//            Path imgPath = Paths.get((ClassLoader.getSystemResource("img").toURI()));
//            Image header = Image.getInstance(imgPath.toAbsolutePath().toString());
//            pdfDoc.add(header);

            // Iterate through the documents and generate a new page for each one
            String previousLabel = "";
            for (Note note : notes) {
                // Group PDF by label
                String label = (note.getLabel() != null)? note.getLabel() : "";
                if (!label.equals(previousLabel)) {
                    // Create a new page
                    pdfDoc.newPage();
                    previousLabel = label;
                    Font font = FontFactory.getFont(FontFactory.TIMES_BOLD, 24, BaseColor.GREEN);
                    Chunk labelHeader = new Chunk(previousLabel, font);
                    pdfDoc.add(labelHeader);
                }



                // Add content to the page
                PdfPTable table = new PdfPTable(2);
                table.addCell("Written By: " + note.getSenderName()
                            + "\nAt: " + note.getCreatedAt().toString() );
                table.addCell(note.getMessage());
                pdfDoc.add(table);
            }

            // Close the PDF document
            pdfDoc.close();

        } catch (Exception e) {
            System.out.println(e);
        }
        return out;
    }
}
