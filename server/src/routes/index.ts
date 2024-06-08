import { Router, Request, Response } from 'express';
import { getPagesFromFirebase, getChapterInfo, getBookInfo, getChapterPages, getBookSubchaptersInfo } from '../utils/firebaseUtils';
import { getUserInfo, setUserBookProgress } from '../utils/firebaseDB';

export const router = Router();

/**
 * @swagger
 * /api/v1/getPages:
 *   get:
 *     summary: Retrieve specific pages from a document in Firebase
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The document ID
 *       - in: query
 *         name: pages
 *         schema:
 *           type: string
 *         required: true
 *         description: The pages to retrieve (e.g., "1-3" or "1,2,3")
 *     responses:
 *       200:
 *         description: A list of pages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Invalid or missing id or pages parameter
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/getChapterInfo:
 *   get:
 *     summary: Retrieve chapter information from Firebase
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The chapter ID
 *     responses:
 *       200:
 *         description: Chapter information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid or missing id parameter
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/getBookInfo:
 *   get:
 *     summary: Retrieve book information from Firebase
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid or missing id parameter
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/v1/getUserInfo:
 *  get:
 *   summary: Retrieve user information from Firebase
 *  parameters:
 *   - in: query
 *     name: id
 *     schema:
 *       type: string
 *     required: true
 *     description: The user ID
 *  responses:
 *    200:
 *     description: User information
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 * 
 */
router.get('/getUserInfo', async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid or missing id parameter" });
    }

    console.log(`Fetching user info for ${id}`);

    try {
        const userInfo = await getUserInfo(id);
        res.json(userInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});


/**
 * @swagger
 * /api/v1/getChapterPages:
 *   get:
 *     summary: Retrieve pages of a chapter from Firebase
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The chapter ID
 *     responses:
 *       200:
 *         description: Link to pages of the chapter, merged into a single PDF
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid or missing id parameter
 *       500:
 *         description: Internal server error
 */
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


router.post('/setUserBookProgress', async (req: Request, res: Response) => {
    console.log('Setting user book progress');

    const { userId, bookId, chapterId, progress } = req.body;

    if (!userId || !bookId || !chapterId || (progress === undefined) || typeof userId !== 'string' || typeof bookId !== 'string' || typeof chapterId !== 'string' || typeof progress !== 'number') {
        console.log(`${userId} ${bookId} ${chapterId} ${progress}`);
        console.log(typeof userId, typeof bookId, typeof chapterId, typeof progress);
        return res.status(400).json({ message: "Invalid or missing userId, bookId, or progress parameter" });
    }

    console.log(`Setting progress for user ${userId} on book ${bookId} in chapter ${chapterId} to ${progress}`);

    try {
        await setUserBookProgress(userId, bookId, chapterId, progress);
        res.json({ message: "Progress set successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
});


/**
 * @swagger
 * /api/v1/getBookSubchaptersInfo:
 *   get:
 *     summary: Retrieve subchapter information of a book from Firebase
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Subchapter information of the book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid or missing id parameter
 *       500:
 *         description: Internal server error
 */
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
