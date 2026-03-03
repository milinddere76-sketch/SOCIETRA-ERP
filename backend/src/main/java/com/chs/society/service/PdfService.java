package com.chs.society.service;

import com.chs.society.model.accounting.Expense;
import com.chs.society.model.accounting.Receipt;
import com.lowagie.text.Rectangle;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    public byte[] generateReceiptPdf(Receipt receipt) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A5.rotate()); // A5 Horizontal

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Fonts
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.DARK_GRAY);
            Font societyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLUE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            // Title
            Paragraph title = new Paragraph("OFFICIAL PAYMENT RECEIPT", headerFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // Society Header
            Paragraph societyName = new Paragraph(receipt.getSociety().getName().toUpperCase(), societyFont);
            societyName.setAlignment(Element.ALIGN_CENTER);
            document.add(societyName);
            document.add(new Paragraph(" "));

            // Main Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            addCellWithLabel(table, "Receipt No:", receipt.getReceiptNumber(), labelFont, normalFont);
            addCellWithLabel(table, "Date:", receipt.getDate().format(DATE_FORMATTER), labelFont, normalFont);
            addCellWithLabel(table, "Received From:",
                    receipt.getMember().getFirstName() + " " + receipt.getMember().getLastName(), labelFont,
                    normalFont);
            addCellWithLabel(table, "Amount Particulars:",
                    receipt.getNarration() != null ? receipt.getNarration() : "Maintenance Dues", labelFont,
                    normalFont);
            addCellWithLabel(table, "Payment Mode:", receipt.getPaymentMode(), labelFont, normalFont);
            addCellWithLabel(table, "Reference:",
                    receipt.getTransactionReference() != null ? receipt.getTransactionReference() : "N/A", labelFont,
                    normalFont);
            addCellWithLabel(table, "Current Balance:",
                    receipt.getCurrentBalance() != null ? receipt.getCurrentBalance().toString() : "0.00", labelFont,
                    normalFont);

            document.add(table);

            // Amount Box
            document.add(new Paragraph(" "));
            Paragraph amountBox = new Paragraph("TOTAL AMOUNT RECEIVED: INR " + receipt.getAmount(), headerFont);
            amountBox.setAlignment(Element.ALIGN_RIGHT);
            document.add(amountBox);

            document.add(new Paragraph("\n\n(Receiver Signature)", normalFont));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Receipt PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generateMaintenanceBillPdf(com.chs.society.model.maintenance.MaintenanceBill bill) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 36);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font societyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLUE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            // Society Header
            Paragraph socName = new Paragraph(bill.getSociety().getName().toUpperCase(), societyFont);
            socName.setAlignment(Element.ALIGN_CENTER);
            document.add(socName);

            Paragraph socAddr = new Paragraph(bill.getSociety().getAddress(), normalFont);
            socAddr.setAlignment(Element.ALIGN_CENTER);
            document.add(socAddr);
            document.add(new Paragraph(" "));

            Paragraph title = new Paragraph("MAINTENANCE BILL", headerFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // Bill Info Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            addCellWithLabel(infoTable, "Bill No:", bill.getBillNumber(), boldFont, normalFont);
            addCellWithLabel(infoTable, "Date:", java.time.LocalDate.now().format(DATE_FORMATTER), boldFont,
                    normalFont);
            addCellWithLabel(infoTable, "Unit No:", bill.getUnit().getUnitNumber(), boldFont, normalFont);
            addCellWithLabel(infoTable, "Member Name:",
                    bill.getUnit().getOwner() != null
                            ? bill.getUnit().getOwner().getFirstName() + " " + bill.getUnit().getOwner().getLastName()
                            : "N/A",
                    boldFont, normalFont);
            addCellWithLabel(infoTable, "Due Date:", bill.getDueDate().format(DATE_FORMATTER), boldFont, normalFont);
            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Particulars Table
            PdfPTable partTable = new PdfPTable(new float[] { 3, 1 });
            partTable.setWidthPercentage(100);

            PdfPCell h1 = new PdfPCell(new Phrase("Description", boldFont));
            h1.setBackgroundColor(Color.LIGHT_GRAY);
            partTable.addCell(h1);

            PdfPCell h2 = new PdfPCell(new Phrase("Amount", boldFont));
            h2.setBackgroundColor(Color.LIGHT_GRAY);
            h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(h2);

            for (com.chs.society.model.maintenance.MaintenanceBillItem item : bill.getItems()) {
                partTable.addCell(new Phrase(item.getName(), normalFont));
                PdfPCell amtCell = new PdfPCell(new Phrase(item.getAmount().toString(), normalFont));
                amtCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                partTable.addCell(amtCell);
            }

            // Subtotal
            PdfPCell subLabel = new PdfPCell(new Phrase("Current Bill Amount", boldFont));
            subLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(subLabel);
            PdfPCell subVal = new PdfPCell(new Phrase(bill.getPrincipalAmount().toString(), boldFont));
            subVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(subVal);

            // Previous Dues
            PdfPCell prevLabel = new PdfPCell(new Phrase("Previous Outstanding", boldFont));
            prevLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(prevLabel);
            PdfPCell prevVal = new PdfPCell(new Phrase(bill.getPreviousDues().toString(), normalFont));
            prevVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(prevVal);

            // Interest
            PdfPCell intLabel = new PdfPCell(new Phrase("Interest on Dues", boldFont));
            intLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(intLabel);
            PdfPCell intVal = new PdfPCell(new Phrase(bill.getInterestAmount().toString(), normalFont));
            intVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(intVal);

            // Total
            PdfPCell totLabel = new PdfPCell(new Phrase("TOTAL PAYABLE", boldFont));
            totLabel.setBackgroundColor(Color.YELLOW);
            totLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(totLabel);
            PdfPCell totVal = new PdfPCell(new Phrase(bill.getTotalAmount().toString(), boldFont));
            totVal.setBackgroundColor(Color.YELLOW);
            totVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            partTable.addCell(totVal);

            document.add(partTable);

            document.add(new Paragraph("\nNote: Please pay before due date to avoid interest.", normalFont));
            document.add(new Paragraph("\n\nAuthorized Signatory", boldFont));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Bill PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generatePaymentVoucherPdf(Expense expense) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A5.rotate());

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.RED);
            Font societyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            Paragraph title = new Paragraph("PAYMENT VOUCHER", headerFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            Paragraph societyName = new Paragraph(expense.getSociety().getName().toUpperCase(), societyFont);
            societyName.setAlignment(Element.ALIGN_CENTER);
            document.add(societyName);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);

            addCellWithLabel(table, "Voucher No:", expense.getVoucherNumber(), labelFont, normalFont);
            addCellWithLabel(table, "Date:", expense.getDate().format(DATE_FORMATTER), labelFont, normalFont);
            addCellWithLabel(table, "Paid To:", expense.getPayee(), labelFont, normalFont);
            addCellWithLabel(table, "Category:",
                    expense.getLedger() != null ? expense.getLedger().getName() : "General Expense", labelFont,
                    normalFont);
            addCellWithLabel(table, "Description:", expense.getDescription(), labelFont, normalFont);
            addCellWithLabel(table, "Amount:", "INR " + expense.getAmount(), labelFont, normalFont);

            document.add(table);

            document.add(new Paragraph("\n\nAuthorized Signatory", normalFont));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Voucher PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generateShareCertificatePdf(com.chs.society.model.ShareCertificate cert) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 30, 30, 30, 30);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Premium Colors
            Color goldColor = new Color(184, 134, 11);
            Color darkBrown = new Color(61, 43, 31);

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.TIMES_BOLDITALIC, 28, darkBrown);
            Font societyFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 22, Color.BLACK);
            Font regFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, goldColor);
            Font dataFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 13, darkBrown);
            Font bodyFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 14, darkBrown);
            Font bodyBoldFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 14, darkBrown);
            Font signLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);

            // Outer Border
            PdfPTable outerTable = new PdfPTable(1);
            outerTable.setWidthPercentage(100);

            PdfPCell outerCell = new PdfPCell();
            outerCell.setBorderWidth(6f);
            outerCell.setBorderColor(goldColor);
            outerCell.setPadding(10f);

            // Inner Border
            PdfPTable innerTable = new PdfPTable(1);
            innerTable.setWidthPercentage(100);
            PdfPCell innerCell = new PdfPCell();
            innerCell.setBorderWidth(1.5f);
            innerCell.setBorderColor(goldColor);
            innerCell.setPadding(30f);
            innerCell.setBackgroundColor(new Color(255, 252, 240)); // Cream background

            // Header Section
            Paragraph header = new Paragraph("Share Certificate", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            innerCell.addElement(header);

            Paragraph subHeader = new Paragraph("(Issued under the Cooperative Societies Act, 1960)", regFont);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            subHeader.setSpacingAfter(20f);
            innerCell.addElement(subHeader);

            Paragraph socName = new Paragraph(cert.getSociety().getName().toUpperCase(), societyFont);
            socName.setAlignment(Element.ALIGN_CENTER);
            innerCell.addElement(socName);

            Paragraph regNo = new Paragraph("Registration No: "
                    + (cert.getSociety().getRegistrationNumber() != null ? cert.getSociety().getRegistrationNumber()
                            : "N/A"),
                    regFont);
            regNo.setAlignment(Element.ALIGN_CENTER);
            innerCell.addElement(regNo);

            Paragraph address = new Paragraph(cert.getSociety().getAddress(), regFont);
            address.setAlignment(Element.ALIGN_CENTER);
            address.setSpacingAfter(25f);
            innerCell.addElement(address);

            // Distinctive Details Table
            PdfPTable detailsTable = new PdfPTable(4);
            detailsTable.setWidthPercentage(100);
            detailsTable.setSpacingAfter(30f);

            addDetailCell(detailsTable, "Certificate No", cert.getCertificateNumber(), labelFont, dataFont);
            addDetailCell(detailsTable, "No. of Shares", String.valueOf(cert.getTotalShares()), labelFont, dataFont);
            addDetailCell(detailsTable, "Distinctive Range", cert.getSharesFrom() + " - " + cert.getSharesTo(),
                    labelFont, dataFont);
            addDetailCell(detailsTable, "Issue Date", cert.getIssueDate().format(DATE_FORMATTER), labelFont, dataFont);
            innerCell.addElement(detailsTable);

            // Certification Text
            Paragraph certifyText = new Paragraph();
            certifyText.setLeading(22f);
            certifyText.setAlignment(Element.ALIGN_CENTER);
            certifyText.add(new Chunk("This is to certify that ", bodyFont));
            certifyText.add(new Chunk(cert.getMemberName().toUpperCase(), bodyBoldFont));
            certifyText.add(new Chunk("\nis the Registered Holder of ", bodyFont));
            certifyText.add(new Chunk(cert.getTotalShares() + " ( " + NumberToWords(cert.getTotalShares()) + " ) ",
                    bodyBoldFont));
            certifyText.add(new Chunk("Shares of INR ", bodyFont));
            certifyText.add(new Chunk(cert.getShareValue().toString(), bodyBoldFont));
            certifyText
                    .add(new Chunk(" each, fully paid up, in the above named Society, attached to Unit: ", bodyFont));
            certifyText.add(new Chunk(cert.getUnit().getUnitNumber(), bodyBoldFont));
            certifyText.setSpacingAfter(40f);
            innerCell.addElement(certifyText);

            // Signature Section
            PdfPTable signTable = new PdfPTable(3);
            signTable.setWidthPercentage(100);

            addSignCell(signTable, "CHAIRMAN", cert.getChairmanName(), signLabelFont);

            // Seal Placeholder
            PdfPCell sealCell = new PdfPCell();
            sealCell.setBorder(Rectangle.NO_BORDER);
            Paragraph sealText = new Paragraph("SOCIETY COMMON SEAL",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, Color.LIGHT_GRAY));
            sealText.setAlignment(Element.ALIGN_CENTER);
            sealCell.addElement(sealText);
            signTable.addCell(sealCell);

            addSignCell(signTable, "SECRETARY / TREASURER", cert.getSecretaryName(), signLabelFont);

            innerCell.addElement(signTable);

            innerTable.addCell(innerCell);
            outerCell.addElement(innerTable);
            outerTable.addCell(outerCell);

            document.add(outerTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Premium Share Certificate PDF", e);
        }
        return baos.toByteArray();
    }

    private void addCell(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.addElement(new Paragraph(label, labelFont));
        cell.addElement(new Paragraph(value, valueFont));
        table.addCell(cell);
    }

    private void addDetailCell(PdfPTable table, String label, String value, Font labelFont, Font dataFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderWidth(0.5f);
        cell.setBorderColor(new Color(200, 200, 200));
        cell.setPadding(8f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph p = new Paragraph(label.toUpperCase(), labelFont);
        p.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p);

        Paragraph v = new Paragraph(value, dataFont);
        v.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(v);

        table.addCell(cell);
    }

    private void addSignCell(PdfPTable table, String label, String name, Font font) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph line = new Paragraph("__________________________", font);
        line.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(line);

        Paragraph l = new Paragraph(label, font);
        l.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(l);

        if (name != null && !name.isEmpty()) {
            Paragraph n = new Paragraph("(" + name + ")", font);
            n.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(n);
        }

        table.addCell(cell);
    }

    private String NumberToWords(int n) {
        // Simple mock for now, can be expanded to a utility class if needed
        return String.valueOf(n);
    }

    private void addCellWithLabel(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setPadding(5);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(value != null ? value : "", valueFont));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setPadding(5);
        table.addCell(cellValue);
    }
}
