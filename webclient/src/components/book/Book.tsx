import { useEffect, useState } from 'react';
import { getBookSubchaptersInfo } from '../../helpers/requests.ts';
import { BookSchema } from '@common/schemas/ts/bookSchema.ts';
import { BookProgress } from '@common/schemas/ts/userSchema.ts';
import ChapterDisplay from './ChapterDisplay.tsx';

function Book(props: { id: string, bookProgress: BookProgress | undefined }) {
    const { id } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [bookInfo, setBookInfo] = useState<BookSchema | undefined>(undefined);

    useEffect(() => {
        let isMounted = true; // Flag to track component mount status

        async function fetchContent() {
            try {
                setIsLoading(true); // Set loading true at the start of the fetch
                const gotBookInfo = await getBookSubchaptersInfo(id);

                if (isMounted) {
                    setBookInfo(gotBookInfo);
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) {
                    setIsLoading(false); // Set loading false after fetch completes
                }
            }
        }

        fetchContent();

        return () => {
            isMounted = false; // Set flag to false when the component unmounts
        };
    }, [id]); // Ensure this effect runs only when `id` changes

    if (isLoading) {
        return <h1>Loading...</h1>;
    }
    else if (!bookInfo) {
        return <h1>Failed to fetch book info</h1>;
    }else {
        const image: string | undefined = bookInfo.metadata.image;
        return (
            <div>
            <h1>Book {bookInfo.title}</h1>
            <img src={image} alt={`Cover for ${bookInfo.title}`} style={{ width: '200px' }} />
            {bookInfo.chapterInfo && bookInfo.chapterInfo.map((chapter) => <ChapterDisplay chapterInfo={chapter} isRootLevel={true} bookProgress={props.bookProgress} />)}
            </div>
        );
    }
}

export default Book;
