import express from 'express';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  runMultiAgentPipeline,
  getDemoResult,
  analyzeStudentThinking,
  getDemoThinkingAnalysis,
  generateSocraticResponse,
  verifySingleStep,
  analyzeHandwrittenSolution,
  predictStudentMistake,
  askMathCoach
} from './src/services/geminiService.js';
import {
  recordUserAttempt,
  getUserDashboardStats,
  getDb,
  recordThinkingAnalysis,
  getRecentThinkingAnalyses,
  recordMethodBattleChoice,
  recordMistakePredictionOutcome,
  recordSocraticSession,
  recordCoachMessage,
  getCoachMessages
} from './src/db/database.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer memory storage for image upload
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Initialize SQLite database at boot
getDb()
  .then(() => console.log('✅ SQLite Database initialized successfully.'))
  .catch((err) => console.error('❌ SQLite Database initialization error:', err));

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MathMentor AI',
    gemini_key_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
  });
});

// Solve Mathematics Problem (Multi-Agent Pipeline)
app.post('/api/solve', async (req, res) => {
  try {
    const { problemText, imageBase64 } = req.body;

    if (!problemText && !imageBase64) {
      return res.status(400).json({ error: 'Please enter a problem or upload an image.' });
    }

    const result = await runMultiAgentPipeline(problemText || 'Solve problem in uploaded image', imageBase64);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/solve:', error);
    res.status(500).json({ error: 'An unexpected error occurred while processing the math problem.' });
  }
});

// Quick Demo Problem Endpoint
app.get('/api/solve/demo', (req, res) => {
  const problem = (req.query.q as string) || '2x + 5 = 17';
  const result = getDemoResult(problem);
  res.json(result);
});

// Record User Attempt (Stores performance & mistakes in SQLite)
app.post('/api/attempts', async (req, res) => {
  try {
    const { problem_text, topic, difficulty, correct, solving_time_sec, mistake_type } = req.body;

    if (!problem_text || !topic) {
      return res.status(400).json({ error: 'Missing required attempt fields.' });
    }

    await recordUserAttempt({
      problem_text,
      topic,
      difficulty: difficulty || 'Medium',
      correct: Boolean(correct),
      solving_time_sec: Number(solving_time_sec) || 30,
      mistake_type
    });

    res.json({ success: true, message: 'Attempt logged to SQLite database.' });
  } catch (error: any) {
    console.error('Error recording attempt:', error);
    res.status(500).json({ error: 'Failed to record attempt.' });
  }
});

// Get User Dashboard Stats & Personalization
app.get('/api/dashboard', async (req, res) => {
  try {
    const stats = await getUserDashboardStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
});

// Image Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    res.json({ success: true, imageBase64: base64Image });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process uploaded file.' });
  }
});

// ----------------------------------------------------------------------
// ADVANCED AI LEARNING UPGRADE ROUTES
// ----------------------------------------------------------------------

// Thinking Path Analyzer Endpoint
app.post('/api/analyze-thinking', async (req, res) => {
  try {
    const { problemText, studentSteps } = req.body;

    if (!problemText || !studentSteps) {
      return res.status(400).json({ error: 'Both problem and student steps are required.' });
    }

    const analysis = await analyzeStudentThinking(problemText, studentSteps);
    const newId = await recordThinkingAnalysis(analysis);
    analysis.id = newId;

    res.json(analysis);
  } catch (error: any) {
    console.error('Error in /api/analyze-thinking:', error);
    const fallback = getDemoThinkingAnalysis(req.body?.problemText || '2x + 5 = 17', req.body?.studentSteps || '');
    res.json(fallback);
  }
});

// Quick Demo for Thinking Path Analyzer
app.get('/api/thinking/demo', (req, res) => {
  const problem = (req.query.problem as string) || '2x + 5 = 17';
  const steps = (req.query.steps as string) || '2x + 5 = 17\n2x = 17 + 5\n2x = 22\nx = 11';
  const result = getDemoThinkingAnalysis(problem, steps);
  res.json(result);
});

// Get Past Thinking Analyses History
app.get('/api/thinking-analyses', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const history = await getRecentThinkingAnalyses(limit);
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching thinking history:', error);
    res.status(500).json({ error: 'Failed to fetch thinking history.' });
  }
});

// Socratic Dialogue Interactive Chat
app.post('/api/socratic/chat', async (req, res) => {
  try {
    const { problemText, conversationHistory } = req.body;
    const studentMessage = req.body.studentMessage || req.body.userMessage || req.body.message;

    if (!studentMessage) {
      return res.status(400).json({ error: 'Student message is required.' });
    }

    const response = await generateSocraticResponse(
      problemText || '2x + 5 = 17',
      conversationHistory || [],
      studentMessage
    );

    res.json(response);
  } catch (error: any) {
    console.error('Error in /api/socratic/chat:', error);
    res.status(500).json({
      content: "Let's inspect this step together. What operation does the opposite of what's on the left?",
      guiding_question: "How can you undo the operation to isolate x?",
      isSolved: false
    });
  }
});

// Single Step Verification
app.post('/api/verify-step', async (req, res) => {
  try {
    const { problemText, previousSteps, newStep } = req.body;

    if (!newStep) {
      return res.status(400).json({ error: 'New step is required.' });
    }

    const result = await verifySingleStep(
      problemText || '',
      previousSteps || [],
      newStep
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/verify-step:', error);
    res.status(500).json({ error: 'Failed to verify step.' });
  }
});

// Handwritten Solution OCR & Diagnostic Analyzer
app.post('/api/handwriting/analyze', async (req, res) => {
  try {
    const { imageBase64, problemText } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided for handwriting analysis.' });
    }

    const analysis = await analyzeHandwrittenSolution(imageBase64, problemText);
    res.json(analysis);
  } catch (error: any) {
    console.error('Error in /api/handwriting/analyze:', error);
    res.status(500).json({ error: 'Failed to analyze handwritten solution.' });
  }
});

// Mistake Prediction Endpoint
app.post('/api/mistake-prediction', async (req, res) => {
  try {
    const { problemText, topic } = req.body;
    const prediction = await predictStudentMistake(problemText || '2x + 5 = 17', topic);
    res.json(prediction);
  } catch (error: any) {
    console.error('Error in /api/mistake-prediction:', error);
    res.status(500).json({ error: 'Failed to generate mistake prediction.' });
  }
});

// Record Mistake Prediction Outcome
app.post('/api/mistake-prediction/outcome', async (req, res) => {
  try {
    const { problem_text, predicted_mistake, confirmed, avoided, actual_mistake } = req.body;
    await recordMistakePredictionOutcome({
      problem_text,
      predicted_mistake,
      confirmed: Boolean(confirmed),
      avoided: Boolean(avoided),
      actual_mistake
    });
    res.json({ success: true, message: 'Prediction outcome logged.' });
  } catch (error: any) {
    console.error('Error logging prediction outcome:', error);
    res.status(500).json({ error: 'Failed to log outcome.' });
  }
});

// Record Method Battle Choice
app.post('/api/method-battle/choice', async (req, res) => {
  try {
    const {
      problem_text,
      chosen_method_id,
      recommended_method_id,
      chosen_method_title,
      recommended_method_title,
      analysis_feedback,
      was_optimal
    } = req.body;

    await recordMethodBattleChoice({
      problem_text,
      chosen_method_id,
      recommended_method_id,
      chosen_method_title,
      recommended_method_title,
      analysis_feedback,
      was_optimal: Boolean(was_optimal)
    });

    res.json({ success: true, message: 'Method preference recorded.' });
  } catch (error: any) {
    console.error('Error recording method battle choice:', error);
    res.status(500).json({ error: 'Failed to record choice.' });
  }
});

// Record Socratic Session
app.post('/api/socratic/session', async (req, res) => {
  try {
    const { problem_text, total_turns, hints_used, solved } = req.body;
    await recordSocraticSession({
      problem_text,
      total_turns: Number(total_turns) || 1,
      hints_used: Number(hints_used) || 0,
      solved: Boolean(solved)
    });
    res.json({ success: true, message: 'Socratic session logged.' });
  } catch (error: any) {
    console.error('Error logging socratic session:', error);
    res.status(500).json({ error: 'Failed to log socratic session.' });
  }
});

// Ask MathMentor Coach
app.post('/api/coach/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const dashboardStats = await getUserDashboardStats();
    const coachResponse = await askMathCoach(question, dashboardStats);

    await recordCoachMessage('student', question);
    await recordCoachMessage('coach', coachResponse.reply, JSON.stringify(coachResponse.recommended_action || {}));

    res.json(coachResponse);
  } catch (error: any) {
    console.error('Error in /api/coach/chat:', error);
    res.status(500).json({ error: 'Failed to get coach response.' });
  }
});

// Get Coach Chat History
app.get('/api/coach/history', async (req, res) => {
  try {
    const history = await getCoachMessages(30);
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching coach history:', error);
    res.status(500).json({ error: 'Failed to fetch coach history.' });
  }
});

// Vite middleware / Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MathMentor AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
