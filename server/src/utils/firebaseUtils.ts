import { storage } from 'firebase-admin';
import { PDFDocument } from 'pdf-lib';
import { fetchChapterInfo, fetchBookInfo, DocumentDataToRecord, jsonifyDocumentData } from './firebaseDB';
import { DocumentData } from 'firebase-admin/firestore';

/**
 * Fetch pages from Firebase Storage
 */
export async function getPagesFromFirebase(docId: string, pages: number[]): Promise<string> {
    const filePaths = pages.map(page => `${docId}/page${page}.pdf`);
    const outputFileName = `${docId}/merged${pages}.pdf`;
    return mergePdfs(filePaths, outputFileName);
}

export async function getChapterInfo(chapterId: string) {
    return fetchChapterInfo(chapterId);
}

export async function getBookInfo(bookId: string) {
    return fetchBookInfo(bookId);
}

export async function getChapterPages(chapterId: string): Promise<string> {
    const chapterInfo = await fetchChapterInfo(chapterId);
    const length = chapterInfo.range[1] - chapterInfo.range[0] + 1;
    const MAX_PAGES = 60;
    if (length > MAX_PAGES) {
        throw new Error('Too many pages requested');
    }
    const pageList = Array.from({ length: length}, (_, i) => i + chapterInfo.range[0]);
    return getPagesFromFirebase(chapterInfo.metadata.book, pageList);
}

async function getSubchaptersInfo(chapterId: string): Promise<Record<string, any> > {
    const chapterInfo = await fetchChapterInfo(chapterId);
    const subchapters = chapterInfo.subchapters;
    const subchapterInfo = await Promise.all(subchapters.map((subchapterId: string) => getSubchaptersInfo(subchapterId)));
    chapterInfo.subchapterInfo = subchapterInfo;
    return DocumentDataToRecord(chapterInfo);
}

/**
 * Adds a "subchapterInfo" field to the chapter object with the subchapter info,
 * represented as a map.
 * Recursively fetches subchapter info for each subchapter.
 * 
 * @param chapterId id of the chapter to fetch
 * @returns a Record representing the chapter info with subchapter info
 */
export async function getBookSubchaptersInfo(bookId: string): Promise<Record<string, any> >{
    const bookInfo = await fetchBookInfo(bookId);
    const chapterInfo: Array<DocumentData> = await Promise.all(bookInfo.chapters.map((chapterId: string) => getSubchaptersInfo(chapterId)));
    bookInfo.chapterInfo = chapterInfo;
    return DocumentDataToRecord(bookInfo);
}

/**
 * Fetches a page from Firebase Storage.
 * @param filePath The path to the file in Firebase Storage.
 * @returns A promise that resolves to the URL of the file.
 */
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
