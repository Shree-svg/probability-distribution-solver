import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import { parseWordProblemLayerA } from './layer_a';
import { parseWordProblemLayerB } from './layer_b';

dotenv.config();

export const app = express();
app.use(express.json());

// CORS headers for local dev Vite client
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    layerB_available: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * POST /api/solve
 * Body: { question: string, useLLM?: boolean }
 *
 * Runs Layer B if useLLM is true and API key is present; otherwise falls back to Layer A.
 * The LLM only parses the problem into structured parameters and query.
 * All math calculations are executed by the local engine (Rule 1).
 */
app.post('/api/solve', async (req: Request, res: Response) => {
  const { question, useLLM } = req.body;
  if (!question || typeof question !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Missing or invalid "question" in request body.',
    });
    return;
  }

  if (useLLM) {
    const result = await parseWordProblemLayerB(question, process.env.GEMINI_API_KEY);
    res.json(result);
  } else {
    const result = parseWordProblemLayerA(question);
    res.json(result);
  }
});

export function startServer(port = process.env.PORT || 3001) {
  return app.listen(port, () => {
    console.log(`Distribution Solver API server running on port ${port}`);
  });
}
