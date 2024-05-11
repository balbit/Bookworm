import { Router, Request, Response } from 'express';
import { getPagesFromFirebase, getChapterInfo, getBookInfo, getChapterPages, getBookSubchaptersInfo } from '../utils/firebaseUtils';

export const router = Router();

// GET /api/v1/getPages
router.get('/getPages', async (req: Request, res: Response) => {
    const { id, pages } = req.query;

    if (!id || !pages || typeof pages !== 'string' || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid or missing id or pages parameter" });
    }

    console.log(`Fetching pages ${pages} from document ${id}`);

    try {
        const pageNumbers = parsePages(pages);
        const files = await getPagesFromFirebase(id, pageNumbers);
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

router.get('/getChapterInfo', async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid or missing id parameter" });
    }

    console.log(`Fetching chapter info for ${id}`);

    try {
        const chapterInfo = await getChapterInfo(id);
        res.json(chapterInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

router.get('/getBookInfo', async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid or missing id parameter" });
    }

    console.log(`Fetching book info for ${id}`);

    try {
        const bookInfo = await getBookInfo(id);
        res.json(bookInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

router.get('/getChapterPages', async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid or missing id parameter" });
    }

    console.log(`Fetching pages for chapter ${id}`);

    try {
        const pages = await getChapterPages(id);
        res.json(pages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

router.get('/getBookSubchaptersInfo', async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid or missing id parameter" });
    }

    console.log(`Fetching subchapter info for book ${id}`);

    try {
        const bookInfo = await getBookSubchaptersInfo(id);
        res.json(bookInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});

function parsePages(pages: string): number[] {
    if (pages.includes('-')) {
        const [start, end] = pages.split('-').map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return pages.split(',').map(Number);
}
