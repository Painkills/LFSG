package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Note;
import com.capstone.lfsg.data.NoteRepo;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.DrawInterface;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
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

            // Create header
            String headerImgPath = "server\\src\\main\\resources\\img\\lfsg_logo.png";
            Image header = Image.getInstance(headerImgPath);

                //Scale image
            float headerScaler = ((pdfDoc.getPageSize().getWidth() - pdfDoc.rightMargin() - pdfDoc.leftMargin()) / header.getWidth()) * 100;
            header.scalePercent(headerScaler);

            // Iterate through the documents and generate a new page for each one
            String previousLabel = "";
            for (Note note : notes) {
                // Group PDF by label
                String label = (note.getLabel() != null)? note.getLabel() : "";
                if (!label.equals(previousLabel)) {
                    // Create a new page
                    pdfDoc.newPage();

                    // Create background for page
                    String backgroundImgPath = "server\\src\\main\\resources\\img\\parchment.png";
                    Image background = Image.getInstance(backgroundImgPath);
                    background.setAbsolutePosition(0, 0);
                    float bgScaler = (pdfDoc.getPageSize().getWidth() / background.getWidth()) * 100;
                    background.scalePercent(bgScaler);
                    pdfDoc.add(background);

                    // add header to new page
                    pdfDoc.add(header);

                    // Update label
                    previousLabel = label;

                    // Add header at top of new page
                    Font headerFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 24, BaseColor.GREEN);
                    Chunk labelHeader = new Chunk(previousLabel, headerFont);
                    pdfDoc.add(labelHeader);
                }
                // Add table to hold notes
                PdfPTable table = new PdfPTable(1);

                // Add Note to the Table
                Font noteFont = FontFactory.getFont(FontFactory.TIMES, 16, BaseColor.BLACK);
                PdfPCell noteCell = new PdfPCell(new Paragraph(note.getMessage(), noteFont));
                table.addCell(noteCell);

                // Add Note Taker Info to the Table
                Font noteTakerFont = FontFactory.getFont(FontFactory.COURIER_OBLIQUE, 12, BaseColor.BLACK);
                PdfPCell noteTakerCell = new PdfPCell(new Paragraph(
                        "Written By: " + note.getSenderName()
                        + "\nAt: " + note.getCreatedAt().toString(),
                        noteTakerFont));
                table.addCell(noteTakerCell);

                // Add table to doc
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
