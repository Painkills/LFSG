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
            float bgScaler = (document.getPageSize().getWidth() / background.getWidth()) * 103;
            background.scalePercent(bgScaler);
            background.setAbsolutePosition(-7, -10);
            writer.getDirectContent().addImage(background, false);
            // Create header
            String headerImgPath = "server\\src\\main\\resources\\img\\staff.png";
            Image header = Image.getInstance(headerImgPath);
            // scale image
            float scaler = ((document.getPageSize().getWidth() - document.rightMargin() - document.leftMargin()) / header.getWidth()) * 50;
            header.scalePercent(scaler);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setAbsolutePosition(document.getPageSize().getWidth() / 2 - header.getWidth() / 2,10);
            writer.getDirectContent().addImage(header, false);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    public void onEndPage(PdfWriter writer, Document document) {
        try {
            // Create footer
            String footerImgPath = "server\\src\\main\\resources\\img\\sword.png";
            Image footer = Image.getInstance(footerImgPath);
            // scale image
            float scaler = ((document.getPageSize().getWidth() - document.rightMargin() - document.leftMargin()) / footer.getWidth()) * 50;
            footer.scalePercent(scaler);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setAbsolutePosition(document.getPageSize().getWidth() / 2 - footer.getWidth() / 2,document.getPageSize().getHeight() - footer.getHeight());
            writer.getDirectContent().addImage(footer, false);
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
