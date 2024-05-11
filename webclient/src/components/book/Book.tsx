import { useEffect, useState } from 'react'
import { getTextbookContent } from '../../helpers/requests.ts'

function Book(props: { id: string }) {
    const { id } = props
    const [isLoading, setIsLoading] = useState(true);
    const [contentURL, setContentURL] = useState("");

    useEffect(() => {
        async function fetchContent() {
            try {
                const content = await getTextbookContent(id, 1, 2);
                console.log(content);
                setContentURL(content);
            } catch (error) {
                console.error(error);
            }
        }
        setIsLoading(true);
        fetchContent();
        setIsLoading(false);
    }, [id]);
    return (
        <div>
        <h1>Book {id}</h1>
        <h2>Loading State: {isLoading}</h2>
        <h2> Retrieved Content URL: {contentURL}</h2>
        <iframe src={contentURL} width="100%" height="1000px"></iframe>
        </div>
    )
}
export default Book