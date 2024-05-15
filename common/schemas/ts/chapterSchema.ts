export interface ChapterSchema {
    id: string;
    title: string;
    range: number[];
    subchapters?: {
        id: string;
    }[];
    subchapterInfo?: ChapterSchema[];
    metadata: { [key: string]: any };
}
