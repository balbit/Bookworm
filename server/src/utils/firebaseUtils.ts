import { storage } from 'firebase-admin';
import { PDFDocument } from 'pdf-lib';

/**
 * Fetch pages from Firebase Storage
 */
export async function getPagesFromFirebase(docId: string, pages: number[]): Promise<string> {
    const filePaths = pages.map(page => `${docId}/page${page}.pdf`);
    const outputFileName = `${docId}/merged${pages}.pdf`;
    return mergePdfs(filePaths, outputFileName);
}

export async function getChapterPagesFromFirebase(chapter: string): Promise<string> {
    const filePaths = [`${docId}/${chapter}.pdf`];
    const outputFileName = `${docId}/${chapter}.pdf`;
    return mergePdfs(filePaths, outputFileName);
}

async function fetchPageFromFirebase(filePath: string): Promise<string> {
    const bucket = storage().bucket();
    const file = bucket.file(filePath);
    const exists = await file.exists();
    if (!exists[0]) {
        throw new Error(`File not found: ${filePath}`);
    }

    interface SignedUrlConfig {
        action: 'read';
        expires: string;
    }
    // Assuming the files are public or appropriate permissions are set
    const signedUrlConfig: SignedUrlConfig = {
        action: 'read',
        expires: '03-09-2491'  // Long expiration for example purposes
    };
    const [url] = await file.getSignedUrl(signedUrlConfig);
    return url;
}


async function mergePdfs(filePaths: Array<string>, outputFileName: string): Promise<string> {
    const bucket = storage().bucket();
    const mergedPdfDoc = await PDFDocument.create();

    for (const filePath of filePaths) {
        const fileBuffer = (await bucket.file(filePath).download())[0];
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdfDoc.addPage(page));
    }

    const mergedPdfBytes = await mergedPdfDoc.save();
    const outputFile = bucket.file(outputFileName);
    const fileBuffer = Buffer.from(mergedPdfBytes);
    await outputFile.save(fileBuffer, { contentType: 'application/pdf' });

    const [url] = await outputFile.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60, // URL expires in 1 hour
    });

    return url;
}

