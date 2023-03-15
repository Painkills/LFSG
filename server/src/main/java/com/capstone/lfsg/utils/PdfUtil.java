package com.capstone.lfsg.utils;

import com.capstone.lfsg.data.Note;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class PdfUtil {
    private HeaderFooterUtil headFootUtil;

    public ByteArrayOutputStream createPDF(Iterable<Note> notes) throws BadElementException, IOException {
        // Get string for font
        String UncialAntiqua = "server\\src\\main\\resources\\fonts\\UncialAntiqua-Regular.ttf";

        // Create a new PDF document
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document pdfDoc = new Document();

        try {
            // Start PdfWriter
            PdfWriter writer = PdfWriter.getInstance(pdfDoc, out);
            // Set headers and footers
            HeaderFooterUtil headAndFoot = new HeaderFooterUtil();
            writer.setPageEvent(headAndFoot);

            // Open doc
            pdfDoc.open();

            // Iterate through the documents and generate a new page for each one
            String previousLabel = "";
            for (Note note : notes) {
                if (note.getLabel() == null || note.getLabel().trim().equals("")) continue;
                // Group PDF by label
                String label = (note.getLabel() != null)? note.getLabel() : "";
                if (!label.equals(previousLabel)) {
                    // Create a new page
                    pdfDoc.newPage();

                    // Update label
                    previousLabel = label;

                    // Add label at top of new page
                    Font labelFont = FontFactory.getFont(UncialAntiqua, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 24, 0, BaseColor.BLACK);
                    Chunk labelHeader = new Chunk(previousLabel, labelFont);
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
