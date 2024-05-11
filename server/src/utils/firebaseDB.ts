import * as admin from 'firebase-admin';
import { DocumentData } from 'firebase-admin/firestore';

enum IDType {
    CHAPTER = 'chapter',
    BOOK = 'book',
    UNKNOWN = 'unknown'
}

function getIdType(id: string): IDType {
    if (id.startsWith('chapter-')) {
        return IDType.CHAPTER;
    } else if (id.startsWith('book-')) {
        return IDType.BOOK;
    } else {
        return IDType.UNKNOWN;
    }
}

function checkIdType(id: string, type: IDType) {
    const idType = getIdType(id);
    if (idType !== type) {
        throw new Error(`Invalid ID type: Expected ${type} but got ${idType}`);
    }
}

/**
 * Fetches a document by its ID from the 'chapterInfo' collection.
 * @param docId The ID of the document to fetch.
 * @returns A promise that resolves to the document data or null if not found.
 */
async function fetchChapterInfo(chapterId: string): Promise<DocumentData> {
    try {
        checkIdType(chapterId, IDType.CHAPTER);
        const docRef = admin.firestore().collection('chapterInfo').doc(chapterId);
        const docSnapshot = await docRef.get();

        if (docSnapshot.exists) {
            const snapshotData = docSnapshot.data();
            if (snapshotData === undefined) {
                throw new Error('Document data is undefined');
            }
            return snapshotData;
        } else {
            throw new Error('Document not found');
        }
    } catch (error) {
        console.error('Error fetching document: ', error);
        throw error;
    }
}


/**
 * Fetches a document by its ID from the 'chapterInfo' collection.
 */
async function fetchBookInfo(bookId: string): Promise<DocumentData> {
    try {
        checkIdType(bookId, IDType.BOOK);
        const docRef = admin.firestore().collection('bookInfo').doc(bookId);
        const docSnapshot = await docRef.get();

        if (docSnapshot.exists) {
            const snapshotData = docSnapshot.data();
            if (snapshotData === undefined) {
                throw new Error('Document data is undefined');
            }
            return snapshotData;
        } else {
            throw new Error('Document not found');
        }
    } catch (error) {
        console.error('Error fetching document: ', error);
        throw error;
    }
}

/**
 * Prepares Firestore data for JSON serialization.
 * Converts Firestore-specific types like Timestamp to standard serializable types.
 * @param docData The Firestore document data.
 * @returns A JSON string representing the document.
 */
export function jsonifyDocumentData(docData: DocumentData): string {
    const dataForJson = Object.entries(docData).reduce((acc, [key, value]) => {
        if (value instanceof admin.firestore.Timestamp) {
            acc[key] = value.toDate().toISOString(); // Convert Timestamp to ISO string
        } else {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);

    return JSON.stringify(dataForJson);
}

export {fetchChapterInfo, fetchBookInfo};
