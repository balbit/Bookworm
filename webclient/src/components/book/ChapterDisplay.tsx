import { useEffect, useState } from 'react';
import { getChapterPages } from '../../helpers/requests.ts';
import { ChapterSchema } from '@common/schemas/ts/chapterSchema.ts';
import { BookProgress } from '@common/schemas/ts/userSchema.ts';
import { setUserBookProgress } from '../../helpers/requests.ts';
import './ChapterDisplay.css';


function ChapterDisplay(props: {chapterInfo: ChapterSchema, isRootLevel?: boolean, bookProgress?: BookProgress}) {
    const { chapterInfo } = props;
    const { id, title, range, subchapters, subchapterInfo, metadata } = chapterInfo;
    const { isRootLevel = false } = props;

    const [expanded, setExpanded] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [contentURL, setContentURL] = useState("");
    const [userID, setUserID] = useState<string | undefined>(undefined);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        if (!userID) {
            const localUserID = localStorage.getItem('userID');
            if (localUserID) {
                setUserID(localUserID);
            }
        }
    }, [userID]);
    
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

    useEffect(() => {
        if (userID) {
            const progress = props.bookProgress?.chapters.find((chapter) => chapter.chapterId === id)?.percentComplete;
            if (progress) {
                setProgress(progress);
            }
        }
    }, [userID, props.bookProgress, id]);

    const updateProgress = async (newProgress: number) => {
        if (userID) {
            console.log(`Setting progress for user ${userID} on book ${metadata.book} in chapter ${id} to ${newProgress}`);
            const bookId = metadata.book;
            try {
                await setUserBookProgress(userID, bookId, id, newProgress);
                console.log(`Progress set for user ${userID} on book ${bookId} in chapter ${id} to ${newProgress}`);
                const thisChapter = props.bookProgress?.chapters.find((chapter) => chapter.chapterId === id);
                if (thisChapter) {
                    thisChapter.percentComplete = newProgress;
                }
                setProgress(newProgress);
            } catch (error) {
                console.error(error);
            }
        }
    };

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
                    <button onClick={(e) => { e.stopPropagation(); updateProgress(progress === 100? 0 : 100); }}>
                        {progress === 100 ? "Not done yet" : "Done reading!"}
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