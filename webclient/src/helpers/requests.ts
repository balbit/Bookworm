import {SERVER_URL} from '../config.ts';

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

function constructPageQuery(first: number, last: number): string {
    return (first === last) ? `${first}`: `${first}-${last}`;
}

export {getTextbookMetadata, getTextbookContent};