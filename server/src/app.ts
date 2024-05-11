import express from 'express';
import { router as pageRoutes } from './routes/index';
import { initializeFirebase } from './utils/firebaseInit';

initializeFirebase();

const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json

// Route setup
app.use('/api/v1', pageRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});