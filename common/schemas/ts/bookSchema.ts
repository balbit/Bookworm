import { ChapterSchema } from './chapterSchema';

export interface BookSchema {
    id: string;
    title: string;
    chapters: undefined[];
    chapterInfo?: ChapterSchema[];
    metadata: { [key: string]: any };
}
