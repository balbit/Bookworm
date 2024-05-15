import { useEffect, useState } from 'react';
import { getChapterPages } from '../../helpers/requests.ts';
import { ChapterSchema } from '@common/schemas/ts/chapterSchema.ts';
import './ChapterDisplay.css';

function ChapterDisplay(props: {chapterInfo: ChapterSchema, isRootLevel?: boolean}) {
    const { chapterInfo } = props;
    const { id, title, range, subchapters, subchapterInfo, metadata } = chapterInfo;
    const { isRootLevel = false } = props;

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

        if (isReading) {
            fetchContent();
        }

        return () => {
            isMounted = false;
        };
    }, [isReading, id]);

    if (subchapters) {
        return (
            <div onClick={(e) => e.stopPropagation()}>
                <div 
                    className={`${isRootLevel ? 'chapter-container' : 'subchapter-container'}`} 
                    onClick={() => {
                        if (subchapters.length > 0) {
                            setExpanded(!expanded);
                        } else {
                            setIsReading(!isReading);
                        }
                    }}
                >
                    <h1>{title}</h1>
                    <h2>{isRootLevel}</h2>
                    <h2>Pages: {range[0]}-{range[1]}</h2>
                    <button onClick={(e) => { e.stopPropagation(); setIsReading(!isReading); }}>
                        {isReading ? "Stop Reading" : "Read"}
                    </button>
                    {isReading && <iframe src={contentURL} width="100%" height="1000px" title={`Book Content ${id}`}></iframe>}
                    {expanded && subchapters && subchapterInfo && (
                        <div>
                            {subchapterInfo.map((subchapter) => (
                                <ChapterDisplay key={subchapter.id} chapterInfo={subchapter} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ChapterDisplay;