import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

/**
 * Generates a simple PDF resume with a unique email to ensure 
 * the backend parses it as a fresh user.
 */
export async function generateResume(options: { 
    name: string; 
    email: string; 
    jobTitle?: string;
    outputPath: string;
}) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { name, email, jobTitle = 'Software Engineer', outputPath } = options;

    page.drawText(name, {
        x: 50,
        y: 750,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Email: ${email}`, {
        x: 50,
        y: 720,
        size: 14,
        font,
        color: rgb(0, 0, 0.8),
    });

    page.drawText(`Job Title: ${jobTitle}`, {
        x: 50,
        y: 695,
        size: 14,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText('Experience:', {
        x: 50,
        y: 650,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('- Built advanced web applications.', {
        x: 50,
        y: 625,
        size: 12,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText('Education:', {
        x: 50,
        y: 580,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('- Bachelor of Science in Computer Science', {
        x: 50,
        y: 555,
        size: 12,
        font,
        color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, pdfBytes);
    return outputPath;
}
