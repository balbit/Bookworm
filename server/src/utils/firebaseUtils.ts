import { storage } from 'firebase-admin';

/**
 * Fetch pages from Firebase Storage
 */
export async function getPagesFromFirebase(docId: string, pages: number[]): Promise<string[]> {
    const promises = pages.map(page =>
        fetchPageFromFirebase(`${docId}/page${page}.pdf`)
    );

    const filesData = await Promise.all(promises);
    return filesData;
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
