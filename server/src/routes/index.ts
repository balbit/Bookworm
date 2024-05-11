import { Router, Request, Response } from 'express';
import { getPagesFromFirebase } from '../utils/firebaseUtils';

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

function parsePages(pages: string): number[] {
    if (pages.includes('-')) {
        const [start, end] = pages.split('-').map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return pages.split(',').map(Number);
}
