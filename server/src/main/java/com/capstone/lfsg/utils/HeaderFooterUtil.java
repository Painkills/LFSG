package com.capstone.lfsg.utils;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPageEventHelper;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class HeaderFooterUtil extends PdfPageEventHelper {

    public void onStartPage(PdfWriter writer, Document document) {
        try {
            // Create background for page
            String backgroundImgPath = "server\\src\\main\\resources\\img\\parchment.png";
            Image background = Image.getInstance(backgroundImgPath);
            background.setAbsolutePosition(-7, -10);

            // Create staff on left
            String headerImgPath = "server\\src\\main\\resources\\img\\staff.png";
            Image staff = Image.getInstance(headerImgPath);
            staff.setAbsolutePosition(document.leftMargin(),document.getPageSize().getHeight() - staff.getHeight() * 2);

            // Create sword on right
            String footerImgPath = "server\\src\\main\\resources\\img\\sword.png";
            Image sword = Image.getInstance(footerImgPath);
            sword.setAbsolutePosition(document.getPageSize().getWidth() - document.rightMargin() - sword.getWidth(),document.getPageSize().getHeight() - sword.getHeight() * 2);

            // scale images
            float bgScaler = (document.getPageSize().getWidth() / background.getWidth()) * 103;
            background.scalePercent(bgScaler);
            float imgScaler = (document.getPageSize().getHeight() / staff.getHeight()) * 25;
            staff.scalePercent(imgScaler);
            sword.scalePercent(imgScaler);

            // add all images
            writer.getDirectContent().addImage(background, false);
            writer.getDirectContent().addImage(staff, false);
            writer.getDirectContent().addImage(sword, false);
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
