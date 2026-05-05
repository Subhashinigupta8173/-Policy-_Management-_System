package com.insurex.policy.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.insurex.policy.entity.Policy;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.renderer.DrawContext;
import com.itextpdf.layout.renderer.IRenderer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfCertificateService {

    public byte[] generateCertificate(Policy policy) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(40, 40, 40, 40);

            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regFont  = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // ── Company Header ──
            document.add(new Paragraph("InsureX Corporation")
                    .setFont(boldFont).setFontSize(26)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(new DeviceRgb(0, 82, 155)));

            document.add(new Paragraph("INSURANCE POLICY CERTIFICATE")
                    .setFont(boldFont).setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(new DeviceRgb(80, 80, 80))
                    .setMarginTop(4));

            // Divider
            document.add(buildDivider());

            // ── Policy Number (prominent) ──
            String pNum = policy.getPolicyNumber() != null ? policy.getPolicyNumber() : "N/A";
            document.add(new Paragraph(pNum)
                    .setFont(boldFont).setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(new DeviceRgb(0, 82, 155))
                    .setMarginTop(10).setMarginBottom(10));

            // ── Details Table ──
            Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setMarginTop(8);

            addRow(table, "Policy Holder",    policy.getUser().getName(),           boldFont, regFont);
            addRow(table, "Email",            policy.getUser().getEmail(),          boldFont, regFont);
            addRow(table, "Product",          policy.getProduct().getName(),        boldFont, regFont);
            addRow(table, "Product Type",     policy.getProduct().getType().name(), boldFont, regFont);
            addRow(table, "Coverage Amount",  "₹ " + policy.getProduct().getCoverageAmount().toPlainString(), boldFont, regFont);
            addRow(table, "Annual Premium",   "₹ " + policy.getPremiumAmount().toPlainString(),               boldFont, regFont);
            addRow(table, "Valid From",       policy.getStartDate() != null ? policy.getStartDate().toString() : "N/A", boldFont, regFont);
            addRow(table, "Valid Until",      policy.getEndDate()   != null ? policy.getEndDate().toString()   : "N/A", boldFont, regFont);
            addRow(table, "Status",           policy.getStatus().name(),            boldFont, regFont);
            addRow(table, "Issue Date",       LocalDate.now().toString(),           boldFont, regFont);

            document.add(table);

            // ── QR Code ──
            String qrContent = String.join("|",
                    "INSUREX",
                    pNum,
                    policy.getUser().getName(),
                    policy.getStatus().name());
            byte[] qrBytes = generateQrCode(qrContent, 150, 150);
            Image qrImage = new Image(ImageDataFactory.create(qrBytes))
                    .setWidth(90).setHeight(90)
                    .setHorizontalAlignment(HorizontalAlignment.RIGHT)
                    .setMarginTop(12);
            document.add(qrImage);

            // ── Footer ──
            document.add(buildDivider());
            document.add(new Paragraph(
                    "This certificate is computer-generated and does not require a physical signature. " +
                    "Generated on " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")) + " IST.")
                    .setFont(regFont).setFontSize(8)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(8));

            document.close();
        } catch (Exception e) {
            log.error("PDF generation failed for policy {}", policy.getId(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    private void addRow(Table table, String label, String value, PdfFont lFont, PdfFont vFont) {
        table.addCell(new Cell()
                .add(new Paragraph(label).setFont(lFont).setFontSize(10))
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(new DeviceRgb(245, 247, 250))
                .setPaddingTop(5).setPaddingBottom(5).setPaddingLeft(8).setPaddingRight(8));
        table.addCell(new Cell()
                .add(new Paragraph(value != null ? value : "N/A").setFont(vFont).setFontSize(10))
                .setBorder(Border.NO_BORDER)
                .setPaddingTop(5).setPaddingBottom(5).setPaddingLeft(8).setPaddingRight(8));
    }

    private LineSeparator buildDivider() {
        com.itextpdf.kernel.pdf.canvas.draw.SolidLine solidLine =
                new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(1f);
        solidLine.setColor(new DeviceRgb(0, 82, 155));
        LineSeparator ls = new LineSeparator(solidLine);
        ls.setWidth(UnitValue.createPercentValue(100));
        ls.setMarginTop(8);
        ls.setMarginBottom(8);
        return ls;
    }

    private byte[] generateQrCode(String content, int width, int height) throws Exception {
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, width, height);
        ByteArrayOutputStream qrStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", qrStream);
        return qrStream.toByteArray();
    }
}
