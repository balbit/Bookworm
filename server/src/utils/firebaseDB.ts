import * as admin from 'firebase-admin';
import { DocumentData } from 'firebase-admin/firestore';
import { db } from './firebaseInit';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BookProgress, ChapterProgress } from '../types/userSchema';

enum IDType {
    CHAPTER = 'chapter',
    BOOK = 'book',
    USER = 'user',
    UNKNOWN = 'unknown'
}

function getIdType(id: string): IDType {
    if (id.startsWith('chapter-')) {
        return IDType.CHAPTER;
    } else if (id.startsWith('book-')) {
        return IDType.BOOK;
    } else if (id.startsWith('user-')) {
        return IDType.USER;
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

export async function getUserInfo(userId: string): Promise<DocumentData> {
    const userRef = admin.firestore().collection('userInfo').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new Error("User not found");
    }

    const userData = userDoc.data();

    if (userData === undefined) {
        throw new Error('User data is undefined');
    }

    return userData;
}

export async function setUserBookProgress(userId: string, bookId: string, chapterId: string, progress: number): Promise<void> {
    const userData = await getUserInfo(userId);
    const bookProgress: BookProgress = userData.progress[bookId];

    if (!bookProgress) {
        // TODO: Handle this case more gracefully
        throw new Error(`Book progress not found for book ${bookId}`);
    }

    const chapters: Array<ChapterProgress> = bookProgress.chapters;

    chapters.forEach((chapter: any) => {
        if (chapter.chapterId === chapterId) {
            chapter.percentComplete = progress;
        }
    });

    // check if a new chapter is being added
    const chapterIds = chapters.map((chapter: any) => chapter.chapterId);
    if (!chapterIds.includes(chapterId)) {
        bookProgress.chapters.push({
            chapterId,
            metadata: {
            },
            percentComplete: progress,
        });
    }

    // update
    const userRef = db.collection('userInfo').doc(userId);
    await userRef.update({
        [`progress.${bookId}.chapters`]: chapters,
    });
}

export function DocumentDataToRecord(docData: DocumentData): Record<string, any> {
    const record = Object.entries(docData).reduce((acc, [key, value]) => {
        if (value instanceof admin.firestore.Timestamp) {
            acc[key] = value.toDate().toISOString(); // Convert Timestamp to ISO string
        } else {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);
    return record;
}

/**
 * Prepares Firestore data for JSON serialization.
 * Converts Firestore-specific types like Timestamp to standard serializable types.
 * @param docData The Firestore document data.
 * @returns A JSON string representing the document.
 */
export function jsonifyDocumentData(docData: DocumentData): string {
    const dataForJson = DocumentDataToRecord(docData);

    return JSON.stringify(dataForJson);
}

export {fetchChapterInfo, fetchBookInfo};
