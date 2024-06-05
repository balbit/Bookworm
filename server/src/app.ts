import express from 'express';
import { router as pageRoutes } from './routes/index';
import { setupSwagger } from './swaggerConfig';
import cors from 'cors';

// Check if the firebase GOOGLE_... variable is set
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Firebase GOOGLE_APPLICATION_CREDENTIALS is not set');
  process.exit(1);
}

import { db } from './utils/firebaseInit';

const app = express();
const port = 3000;

app.use(cors()); // CORS middleware

app.use(express.json()); // for parsing application/json


// Route setup
app.use('/api/v1', pageRoutes);

setupSwagger(app);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
