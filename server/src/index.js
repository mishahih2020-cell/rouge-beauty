import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import salonRouter from './routes/salon.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json());

app.use('/api/salon', salonRouter);
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Раздаём собранный фронтенд (npm run build в корне проекта), чтобы не зависеть от Netlify.
const distDir = path.join(__dirname, '..', '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`ROUGE Beauty backend слушает на http://localhost:${PORT}`);
});
