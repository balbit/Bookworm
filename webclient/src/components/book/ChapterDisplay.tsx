import { useEffect, useState } from 'react';
import { getChapterPages } from '../../helpers/requests.ts';
import { ChapterSchema } from '@common/schemas/ts/chapterSchema.ts';

function ChapterDisplay(props: {chapterInfo: ChapterSchema}) {
    const { chapterInfo } = props;
    const { id, title, range, subchapters, subchapterInfo, metadata } = chapterInfo;

    const [expanded, setExpanded] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [contentURL, setContentURL] = useState("");
    
    useEffect(() => {
        let isMounted = true; // Flag to track component mount status

        async function fetchContent() {
            try {
                setIsLoading(true); // Set loading true at the start of the fetch
                const content = await getChapterPages(id);
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
            isMounted = false;
        };
    }, [isReading]);

    if (subchapters) {
        return (
            <div>
                <h1>{title}</h1>
                <h2>Pages: {range[0]}-{range[1]}</h2>
                <button onClick={() => setExpanded(!expanded)}>{expanded ? "Collapse" : "Expand"}</button>
                <button onClick={() => setIsReading(!isReading)}>{isReading ? "Stop Reading" : "Read"}</button>
                {isReading && <iframe src={contentURL} width="100%" height="1000px" title={`Book Content ${id}`}></iframe>}
                {expanded && subchapterInfo && subchapterInfo.map((subchapter) => <ChapterDisplay key={subchapter.id} chapterInfo={subchapter} />)}
            </div>
        );
    }
}

export default ChapterDisplay;