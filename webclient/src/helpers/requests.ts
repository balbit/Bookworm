import {SERVER_URL} from '../config.ts';
import { BookSchema } from '@common/schemas/ts/bookSchema';
import { ChapterSchema } from '@common/schemas/ts/chapterSchema.ts';
import { UserSchema } from '@common/schemas/ts/userSchema';
import axios from 'axios';

const BASE_URL = `${SERVER_URL}/api/v1`;

/**
 * Creates a Textbook Metadata object representing the metadata for a textbook
 * 
 * @param textbookID The ID of the textbook to get metadata for
 * @returns A TextbookMetadata object representing the metadata for the textbook
 * @throws error if the textbookID is invalid or server is unreachable
 */
function getTextbookMetadata(textbookID: string): void{
    console.log(`Getting chapters for book ${textbookID} from ${SERVER_URL}`);
}

/**
 * Returns a URL pointing to a PDF of the textbook
 * 
 * @param textbookID the ID of the textbook to get content for
 * @param firstPage a positive integer representing the start page of the content to get
 * @param lastPage a positive integer representing the start page of the content to get (inclusive)
 * @returns a URL pointing to a PDF of the textbook
 * @throws error if the textbookID is invalid or server is unreachable
 */
async function getTextbookContent(textbookID: string, firstPage: number, lastPage: number): Promise<string>{
    const url = new URL(`${SERVER_URL}/api/v1/getPages`);
    url.searchParams.append('id', textbookID);
    url.searchParams.append('pages', constructPageQuery(firstPage, lastPage));
    console.log(`Getting content for book ${textbookID} from ${url}`);

    return fetch(url).then(
        async (response) => {
            if (!response.ok) {
                throw new Error(`Error fetching content for book ${textbookID} from ${url}: ${response.statusText}`);
            }
            const content = await response.json();
            console.log(content);
            return content;
        }
    ).catch((err) => {
        console.error(`Error fetching content for book ${textbookID} from ${url}: ${err}`);
        throw err;
    });
}

export const getPages = async (id: string, pages: string): Promise<string[]> => {
    try {
        const response = await axios.get<string[]>(`${BASE_URL}/getPages`, {
            params: { id, pages }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch pages');
    }
};

export const getChapterInfo = async (id: string): Promise<ChapterSchema> => {
    try {
        const response = await axios.get<ChapterSchema>(`${BASE_URL}/getChapterInfo`, {
            params: { id }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch chapter info');
    }
};

export const getBookInfo = async (id: string): Promise<BookSchema> => {
    try {
        const response = await axios.get<BookSchema>(`${BASE_URL}/getBookInfo`, {
            params: { id }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch book info');
    }
};

export const getChapterPages = async (id: string): Promise<string> => {
    try {
        const response = await axios.get<string>(`${BASE_URL}/getChapterPages`, {
            params: { id }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch chapter pages');
    }
};

export const getBookSubchaptersInfo = async (id: string): Promise<BookSchema> => {
    try {
        const response = await axios.get<BookSchema>(`${BASE_URL}/getBookSubchaptersInfo`, {
            params: { id }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch book subchapter info');
    }
};

export const getUserInfo = async (id: string): Promise<UserSchema> => {
    try {
        const response = await axios.get<UserSchema>(`${BASE_URL}/getUserInfo`, {
            params: { id }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch user info for user ID: ' + id);
    }
}

export const setUserBookProgress = async (id: string, bookId: string, chapterId: string, progress: number): Promise<void> => {
    try {
        console.log(`Setting progress for user ${id} on book ${bookId} in chapter ${chapterId} to ${progress}`);
        await axios.post(`${BASE_URL}/setUserBookProgress`, {
            userId: id,
            bookId: bookId,
            chapterId: chapterId,
            progress: progress
        });
    } catch (error) {
        console.error(error);
        throw new Error('Failed to set user book progress');
    }
}

function constructPageQuery(first: number, last: number): string {
    return (first === last) ? `${first}`: `${first}-${last}`;
}
