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
        Document document = new Document(PageSize.A5.rotate(), 20, 20, 20, 20);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Colors
            Color navyBlue = new Color(0, 51, 102);
            Color lightGray = new Color(245, 245, 245);
            Color darkGray = new Color(70, 70, 70);

            // Fonts
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, navyBlue);
            Font societyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, darkGray);
            Font societyDetailsFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, darkGray);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, navyBlue);
            Font highlightFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, navyBlue);

            // Outer Frame
            PdfPTable outerTable = new PdfPTable(1);
            outerTable.setWidthPercentage(100);
            PdfPCell outerCell = new PdfPCell();
            outerCell.setBorderColor(navyBlue);
            outerCell.setBorderWidth(3f);
            outerCell.setPadding(15f);

            // Header Section
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);

            PdfPCell titleCell = new PdfPCell(new Phrase("OFFICIAL PAYMENT RECEIPT", headerFont));
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            titleCell.setPaddingBottom(10f);
            headerTable.addCell(titleCell);

            PdfPCell socNameCell = new PdfPCell(new Phrase(receipt.getSociety().getName().toUpperCase(), societyFont));
            socNameCell.setBorder(Rectangle.NO_BORDER);
            socNameCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerTable.addCell(socNameCell);

            String regNo = receipt.getSociety().getRegistrationNumber() != null
                    ? "Reg No: " + receipt.getSociety().getRegistrationNumber() + " | "
                    : "";
            PdfPCell socAddrCell = new PdfPCell(
                    new Phrase(regNo + receipt.getSociety().getAddress(), societyDetailsFont));
            socAddrCell.setBorder(Rectangle.NO_BORDER);
            socAddrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            socAddrCell.setPaddingBottom(15f);
            headerTable.addCell(socAddrCell);

            outerCell.addElement(headerTable);

            // Separator Line
            PdfPTable separator = new PdfPTable(1);
            separator.setWidthPercentage(100);
            PdfPCell sepCell = new PdfPCell();
            sepCell.setBorderColor(navyBlue);
            sepCell.setBorderWidthTop(1f);
            sepCell.setBorder(Rectangle.TOP);
            sepCell.setPaddingBottom(15f);
            separator.addCell(sepCell);
            outerCell.addElement(separator);

            // Main Data Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(20f);

            addStandardDataCell(table, "Receipt No:", receipt.getReceiptNumber(), labelFont, normalFont, lightGray);
            addStandardDataCell(table, "Date:", receipt.getDate().format(DATE_FORMATTER), labelFont, normalFont,
                    lightGray);
            addStandardDataCell(table, "Received From:",
                    receipt.getMember().getFirstName() + " " + receipt.getMember().getLastName(), labelFont,
                    normalFont, Color.WHITE);
            addStandardDataCell(table, "Particulars:",
                    receipt.getNarration() != null ? receipt.getNarration() : "Maintenance Dues", labelFont,
                    normalFont, Color.WHITE);
            addStandardDataCell(table, "Payment Mode:", receipt.getPaymentMode(), labelFont, normalFont, lightGray);
            addStandardDataCell(table, "Reference:",
                    receipt.getTransactionReference() != null ? receipt.getTransactionReference() : "N/A", labelFont,
                    normalFont, lightGray);

            outerCell.addElement(table);

            // Footer / Amount section
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);

            // Signature area
            PdfPCell signCell = new PdfPCell();
            signCell.setBorder(Rectangle.NO_BORDER);
            signCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            signCell.addElement(new Paragraph("\n\n__________________________\nAuthorized Signatory", normalFont));
            footerTable.addCell(signCell);

            // Amount Box
            PdfPCell amountCell = new PdfPCell();
            amountCell.setBorderColor(navyBlue);
            amountCell.setBorderWidth(2f);
            amountCell.setBackgroundColor(lightGray);
            amountCell.setPadding(10f);
            amountCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph amtLabel = new Paragraph("TOTAL AMOUNT RECEIVED", labelFont);
            amtLabel.setAlignment(Element.ALIGN_RIGHT);
            Paragraph amtValue = new Paragraph("INR " + receipt.getAmount(), highlightFont);
            amtValue.setAlignment(Element.ALIGN_RIGHT);

            amountCell.addElement(amtLabel);
            amountCell.addElement(amtValue);
            footerTable.addCell(amountCell);

            outerCell.addElement(footerTable);

            // Balance note
            if (receipt.getCurrentBalance() != null) {
                Paragraph balNote = new Paragraph("Current Outstanding Balance: INR " + receipt.getCurrentBalance(),
                        societyDetailsFont);
                balNote.setAlignment(Element.ALIGN_RIGHT);
                balNote.setSpacingBefore(5f);
                outerCell.addElement(balNote);
            }

            outerTable.addCell(outerCell);
            document.add(outerTable);

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
        Document document = new Document(PageSize.A5.rotate(), 20, 20, 20, 20);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Colors
            Color maroon = new Color(128, 0, 0);
            Color lightGray = new Color(245, 245, 245);
            Color darkGray = new Color(70, 70, 70);

            // Fonts
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, maroon);
            Font societyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, darkGray);
            Font societyDetailsFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, darkGray);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, maroon);
            Font highlightFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, maroon);

            // Outer Frame
            PdfPTable outerTable = new PdfPTable(1);
            outerTable.setWidthPercentage(100);
            PdfPCell outerCell = new PdfPCell();
            outerCell.setBorderColor(maroon);
            outerCell.setBorderWidth(3f);
            outerCell.setPadding(15f);

            // Header Section
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);

            PdfPCell titleCell = new PdfPCell(new Phrase("PAYMENT VOUCHER", headerFont));
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            titleCell.setPaddingBottom(10f);
            headerTable.addCell(titleCell);

            PdfPCell socNameCell = new PdfPCell(new Phrase(expense.getSociety().getName().toUpperCase(), societyFont));
            socNameCell.setBorder(Rectangle.NO_BORDER);
            socNameCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerTable.addCell(socNameCell);

            String regNo = expense.getSociety().getRegistrationNumber() != null
                    ? "Reg No: " + expense.getSociety().getRegistrationNumber() + " | "
                    : "";
            PdfPCell socAddrCell = new PdfPCell(
                    new Phrase(regNo + expense.getSociety().getAddress(), societyDetailsFont));
            socAddrCell.setBorder(Rectangle.NO_BORDER);
            socAddrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            socAddrCell.setPaddingBottom(15f);
            headerTable.addCell(socAddrCell);

            outerCell.addElement(headerTable);

            // Separator Line
            PdfPTable separator = new PdfPTable(1);
            separator.setWidthPercentage(100);
            PdfPCell sepCell = new PdfPCell();
            sepCell.setBorderColor(maroon);
            sepCell.setBorderWidthTop(1f);
            sepCell.setBorder(Rectangle.TOP);
            sepCell.setPaddingBottom(15f);
            separator.addCell(sepCell);
            outerCell.addElement(separator);

            // Main Data Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(20f);

            addStandardDataCell(table, "Voucher No:", expense.getVoucherNumber(), labelFont, normalFont, lightGray);
            addStandardDataCell(table, "Date:", expense.getDate().format(DATE_FORMATTER), labelFont, normalFont,
                    lightGray);
            addStandardDataCell(table, "Paid To:", expense.getPayee(), labelFont, normalFont, Color.WHITE);
            addStandardDataCell(table, "Category:",
                    expense.getLedger() != null ? expense.getLedger().getName() : "General Expense", labelFont,
                    normalFont, Color.WHITE);

            PdfPCell descCell = new PdfPCell();
            descCell.setColspan(2);
            descCell.setBorder(Rectangle.BOTTOM);
            descCell.setBorderColor(new Color(220, 220, 220));
            descCell.setPadding(8f);
            descCell.addElement(new Paragraph("Description: " + expense.getDescription(), normalFont));
            table.addCell(descCell);

            outerCell.addElement(table);

            // Footer / Amount section
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);

            // Signature area
            PdfPCell signCell = new PdfPCell();
            signCell.setBorder(Rectangle.NO_BORDER);
            signCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            signCell.addElement(new Paragraph("\n\n__________________________\nAuthorized Signatory", normalFont));
            footerTable.addCell(signCell);

            // Amount Box
            PdfPCell amountCell = new PdfPCell();
            amountCell.setBorderColor(maroon);
            amountCell.setBorderWidth(2f);
            amountCell.setBackgroundColor(lightGray);
            amountCell.setPadding(10f);
            amountCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph amtLabel = new Paragraph("TOTAL AMOUNT PAID", labelFont);
            amtLabel.setAlignment(Element.ALIGN_RIGHT);
            Paragraph amtValue = new Paragraph("INR " + expense.getAmount(), highlightFont);
            amtValue.setAlignment(Element.ALIGN_RIGHT);

            amountCell.addElement(amtLabel);
            amountCell.addElement(amtValue);
            footerTable.addCell(amountCell);

            outerCell.addElement(footerTable);

            outerTable.addCell(outerCell);
            document.add(outerTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Voucher PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] generateShareCertificatePdf(com.chs.society.model.ShareCertificate cert) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(new Rectangle(842, 595), 30, 30, 30, 30); // Custom premium landscape size

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // Premium Colors Palette
            Color goldColor = new Color(184, 134, 11);
            Color darkBrown = new Color(61, 43, 31);
            Color creamBg = new Color(255, 252, 240);
            Color subtleGold = new Color(218, 165, 32, 50);

            // Typography
            Font titleFont = FontFactory.getFont(FontFactory.TIMES_BOLDITALIC, 34, darkBrown);
            Font societyNameFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 26, Color.BLACK);
            Font regFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, goldColor);
            Font italicSmall = FontFactory.getFont(FontFactory.TIMES_ITALIC, 11, Color.GRAY);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, goldColor);
            Font dataFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 14, darkBrown);
            Font bodyFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 14, darkBrown);
            Font bodyBoldFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 15, darkBrown);
            Font signNameFont = FontFactory.getFont(FontFactory.TIMES_BOLDITALIC, 12, darkBrown);
            Font signLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.GRAY);

            // Master Outer Frame
            PdfPTable outerTable = new PdfPTable(1);
            outerTable.setWidthPercentage(100);

            PdfPCell outerCell = new PdfPCell();
            outerCell.setBorderWidth(6f);
            outerCell.setBorderColor(goldColor);
            outerCell.setPadding(8f);
            outerCell.setBackgroundColor(Color.WHITE);

            // Secondary Inner Border
            PdfPTable midTable = new PdfPTable(1);
            midTable.setWidthPercentage(100);
            PdfPCell midCell = new PdfPCell();
            midCell.setBorderWidth(1.5f);
            midCell.setBorderColor(goldColor);
            midCell.setPadding(2f);

            // Tertiary Core Content Area
            PdfPTable innerTable = new PdfPTable(1);
            innerTable.setWidthPercentage(100);
            PdfPCell innerCell = new PdfPCell();
            innerCell.setBorderWidth(1f);
            innerCell.setBorderColor(subtleGold);
            innerCell.setPadding(30f);
            innerCell.setBackgroundColor(creamBg);

            // Watermark (Fake via colored central text)
            // Header Section
            Paragraph socName = new Paragraph(cert.getSociety().getName().toUpperCase(), societyNameFont);
            socName.setAlignment(Element.ALIGN_CENTER);
            socName.setSpacingAfter(2f);
            innerCell.addElement(socName);

            Paragraph regNo = new Paragraph("REG NO: " + (cert.getSociety().getRegistrationNumber() != null
                    ? cert.getSociety().getRegistrationNumber().toUpperCase()
                    : "N/A"), regFont);
            regNo.setAlignment(Element.ALIGN_CENTER);
            regNo.setSpacingAfter(8f);
            innerCell.addElement(regNo);

            Paragraph address = new Paragraph(cert.getSociety().getAddress().toUpperCase(),
                    FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY));
            address.setAlignment(Element.ALIGN_CENTER);
            address.setSpacingAfter(30f);
            innerCell.addElement(address);

            Paragraph header = new Paragraph("Share Certificate", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(5f);
            innerCell.addElement(header);

            Paragraph statutory = new Paragraph("(Issued under the Cooperative Societies Act, 1960)", italicSmall);
            statutory.setAlignment(Element.ALIGN_CENTER);
            statutory.setSpacingAfter(25f);
            innerCell.addElement(statutory);

            // Distinctive Details Table
            PdfPTable detailsTable = new PdfPTable(4);
            detailsTable.setWidthPercentage(95);
            detailsTable.setSpacingAfter(35f);

            addPremiumDetailCell(detailsTable, "CERTIFICATE NO.", cert.getCertificateNumber(), labelFont, dataFont);
            addPremiumDetailCell(detailsTable, "TOTAL SHARES", String.valueOf(cert.getTotalShares()), labelFont,
                    dataFont);
            addPremiumDetailCell(detailsTable, "DISTINCTIVE NOS.", cert.getSharesFrom() + " to " + cert.getSharesTo(),
                    labelFont, dataFont);
            addPremiumDetailCell(detailsTable, "DATE OF ISSUE", cert.getIssueDate().format(DATE_FORMATTER), labelFont,
                    dataFont);
            innerCell.addElement(detailsTable);

            // Certification Text
            Paragraph justifyText = new Paragraph();
            justifyText.setLeading(26f);
            justifyText.setAlignment(Element.ALIGN_JUSTIFIED);

            justifyText.add(new Chunk("This is to certify that ", bodyFont));
            justifyText.add(new Chunk(cert.getMemberName().toUpperCase(), bodyBoldFont));
            justifyText.add(new Chunk(" is the Registered Holder of ", bodyFont));
            justifyText.add(new Chunk(cert.getTotalShares() + " (" + NumberToWords(cert.getTotalShares()) + ") ",
                    bodyBoldFont));
            justifyText.add(new Chunk("Shares of Rupees ", bodyFont));
            justifyText.add(new Chunk(cert.getShareValue().toString() + "/-", bodyBoldFont));
            justifyText.add(new Chunk(
                    " each, fully paid up, in the above-named Society, subject to the Rules and By-Laws of the Society, attached to Unit: ",
                    bodyFont));
            justifyText.add(new Chunk(cert.getUnit().getUnitNumber(), bodyBoldFont));
            justifyText.add(new Chunk(".", bodyFont));

            justifyText.setSpacingAfter(50f);
            innerCell.addElement(justifyText);

            // Signature Section
            PdfPTable signTable = new PdfPTable(3);
            signTable.setWidthPercentage(100);

            addPremiumSignCell(signTable, "CHAIRMAN", cert.getChairmanName(), signNameFont, signLabelFont);

            PdfPCell sealCell = new PdfPCell();
            sealCell.setBorder(Rectangle.NO_BORDER);
            sealCell.setPaddingTop(15f);
            sealCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            sealCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            // Stylized seal circle representation
            PdfPTable sealDesignTable = new PdfPTable(1);
            sealDesignTable.setWidthPercentage(50);
            PdfPCell cCircle = new PdfPCell(
                    new Phrase("COMMON\nSEAL", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, subtleGold)));
            cCircle.setHorizontalAlignment(Element.ALIGN_CENTER);
            cCircle.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cCircle.setFixedHeight(70f);
            cCircle.setBorderColor(subtleGold);
            cCircle.setBorderWidth(2f);
            sealDesignTable.addCell(cCircle);
            sealCell.addElement(sealDesignTable);

            signTable.addCell(sealCell);

            addPremiumSignCell(signTable, "SECRETARY / TREASURER", cert.getSecretaryName(), signNameFont,
                    signLabelFont);

            innerCell.addElement(signTable);

            // Package tables into each other
            innerTable.addCell(innerCell);
            midCell.addElement(innerTable);
            midTable.addCell(midCell);
            outerCell.addElement(midTable);
            outerTable.addCell(outerCell);

            document.add(outerTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Premium Share Certificate PDF", e);
        }
        return baos.toByteArray();
    }

    private void addPremiumDetailCell(PdfPTable table, String label, String value, Font labelFont, Font dataFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderWidth(1f);
        cell.setBorderColor(new Color(218, 165, 32)); // Golden-ish
        cell.setPadding(8f);
        cell.setPaddingBottom(12f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph p = new Paragraph(label, labelFont);
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(4f);
        cell.addElement(p);

        Paragraph v = new Paragraph(value, dataFont);
        v.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(v);

        table.addCell(cell);
    }

    private void addPremiumSignCell(PdfPTable table, String label, String name, Font nameFont, Font labelFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_BOTTOM);
        cell.setPaddingTop(30f);

        if (name != null && !name.isEmpty()) {
            Paragraph n = new Paragraph(name.toUpperCase(), nameFont);
            n.setAlignment(Element.ALIGN_CENTER);
            n.setSpacingAfter(5f);
            cell.addElement(n);
        } else {
            cell.addElement(new Paragraph("\n\n")); // Space for manual signing
        }

        Paragraph line = new Paragraph("_______________________",
                FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK));
        line.setAlignment(Element.ALIGN_CENTER);
        line.setSpacingAfter(2f);
        cell.addElement(line);

        Paragraph l = new Paragraph(label, labelFont);
        l.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(l);

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

    private void addStandardDataCell(PdfPTable table, String label, String value, Font labelFont, Font dataFont,
            Color bgColor) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setBackgroundColor(bgColor);
        cellLabel.setBorderColor(new Color(220, 220, 220));
        cellLabel.setPadding(8f);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(value, dataFont));
        cellValue.setBackgroundColor(Color.WHITE);
        cellValue.setBorderColor(new Color(220, 220, 220));
        cellValue.setPadding(8f);
        table.addCell(cellValue);
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
