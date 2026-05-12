import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Serve frontend if in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Serve React static files (Vite builds to /dist)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// React Router Catch-All
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start the server (Required for Render and local testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

export default app;
