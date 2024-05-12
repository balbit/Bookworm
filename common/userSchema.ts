interface User {
    id: string; // The ID of the user.
    name: string; // The name of the user.
    email: string; // The email address of the user.
    books: string[]; // A list of books in the user's library.
    progress: {
        [bookId: string]: BookProgress; // List of progress entries for each chapter of the book.
    };
    metadata: Record<string, any>; // Metadata for the user.
}

interface BookProgress {
    chapters: ChapterProgress[];
    metadata: Record<string, any>;
}

interface ChapterProgress {
    chapterId: string; // The ID of the chapter.
    percentComplete: number; // The percentage of the chapter completed.
    metadata: Record<string, any>; // Metadata for the chapter progress.
}
