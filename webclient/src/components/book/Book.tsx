import { useEffect, useState } from 'react';
import { getTextbookContent } from '../../helpers/requests.ts';

function Book(props: { id: string }) {
    const { id } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [contentURL, setContentURL] = useState("");

    useEffect(() => {
        let isMounted = true; // Flag to track component mount status

        async function fetchContent() {
            try {
                setIsLoading(true); // Set loading true at the start of the fetch
                const content = await getTextbookContent(id, 1, 2);
                console.log(content);
                if (isMounted) {
                    setContentURL(content);
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

    return (
        <div>
            <h1>Book {id}</h1>
            <h2>Loading State: {isLoading ? "Loading..." : "Loaded"}</h2>
            <h2>Retrieved Content URL: {contentURL}</h2>
            <iframe src={contentURL} width="100%" height="1000px" title={`Book Content ${id}`}></iframe>
        </div>
    );
}

export default Book;
