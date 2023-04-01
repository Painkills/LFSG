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
import java.util.Date;

@Service
public class PdfUtil {

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

            PdfPTable titleTable = new PdfPTable(1);

            // Add title page
            Font titleFont = FontFactory.getFont(UncialAntiqua, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 48, 0, BaseColor.BLACK);
            PdfPCell titleCell = new PdfPCell(new Paragraph("Looking For Study Group", titleFont));
            titleCell.setBorder(0);
            titleCell.setHorizontalAlignment(1);
            titleCell.setPaddingTop(30);
            titleCell.setPaddingBottom(30);
            titleTable.addCell(titleCell);

            Font subtitleFont = FontFactory.getFont(UncialAntiqua, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 36, 0, BaseColor.BLACK);
            PdfPCell subtitleCell = new PdfPCell(new Paragraph("Raid Notes", subtitleFont));
            subtitleCell.setBorder(0);
            subtitleCell.setHorizontalAlignment(1);
            subtitleCell.setPaddingBottom(10);
            titleTable.addCell(subtitleCell);

            Font dateFont = FontFactory.getFont(UncialAntiqua, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 24, 0, BaseColor.BLACK);
            PdfPCell dateCell = new PdfPCell(new Paragraph(java.time.LocalDate.now().toString(), dateFont));
            dateCell.setBorder(0);
            dateCell.setHorizontalAlignment(1);
            titleTable.addCell(dateCell);

            pdfDoc.add(titleTable);

            // Iterate through the documents and generate a new page for each one
            String previousLabel = "";
            for (Note note : notes) {
                // Add table to hold notes
                PdfPTable table = new PdfPTable(1);

                // Skip unlabeled notes
                if (note.getLabel() == null || note.getLabel().trim().equals("")) continue;

                // Group PDF by label
                String label = note.getLabel();
                System.out.println("Label: " + label + " Created: " + note.getCreatedAt());
                if (!label.equals(previousLabel)) {
                    // Create a new page
                    pdfDoc.newPage();

                    // Update label
                    previousLabel = label;

                    // Add label at top of new page
                    Font labelFont = FontFactory.getFont(UncialAntiqua, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 24, 0, BaseColor.BLACK);
                    PdfPCell labelCell = new PdfPCell(new Paragraph(previousLabel, labelFont));
                    labelCell.setBorder(0);
                    table.addCell(labelCell);
                }
                // Add Note to the Table
                Font noteFont = FontFactory.getFont(FontFactory.TIMES, 16, BaseColor.BLACK);
                PdfPCell noteCell = new PdfPCell(new Paragraph(note.getMessage(), noteFont));
                noteCell.setBorder(0);
                noteCell.setPaddingBottom(10);
                table.addCell(noteCell);

                // Add Note Taker Info to the Table
                Font noteTakerFont = FontFactory.getFont(FontFactory.COURIER_OBLIQUE, 12, BaseColor.BLACK);
                PdfPCell noteTakerCell = new PdfPCell(new Paragraph(
                        "Written By: " + note.getSenderName()
                                + "\nGold Earned: " + note.getGold() + "\n\n",
                        noteTakerFont));
                noteTakerCell.setBorder(0);
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
