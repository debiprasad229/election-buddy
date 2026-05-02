import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

dotenv.config();

const app = express();
const port = 3002;

// --- SECURITY: BASE HARDENING ---
app.use(helmet()); // Sets various HTTP headers for security (XSS, Clickjacking, etc.)
// --------------------------------

// --- SECURITY: CORS RESTRICTION ---
const allowedOrigins = [
  'http://localhost:5173', // Local Vite development
  /https?:\/\/.*\.a\.run\.app$/ // Google Cloud Run production domains
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  }
}));
// ------------------------------------

app.use(express.json());

// --- SECURITY: PROMPT INJECTION DEFENSE ---
const forbiddenPatterns = [
  /ignore all/i,
  /previous instructions/i,
  /system prompt/i,
  /as a malicious/i,
  /forget your/i,
  /new persona/i,
  /dan mode/i,
  /you are now/i,
  /jailbreak/i
];

const containsInjection = (text) => {
  if (typeof text !== 'string') return false;
  return forbiddenPatterns.some(pattern => pattern.test(text));
};
// ------------------------------------------

// --- SECURITY: RATE LIMITING ---
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: { error: 'Too many requests from this IP, please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting specifically to AI endpoints to prevent cost abuse
app.use('/api/', apiLimiter);
// -------------------------------

// --- SECURITY: INPUT VALIDATION ---
const SecuritySchema = z.object({
  prompt: z.string().min(1).max(5000),
  languageName: z.string().max(50).optional(),
  languageCode: z.string().max(10).optional()
});

const ChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1).max(2000)
  })).max(50) // Allow up to 50 messages in history
});
// ----------------------------------

app.post('/api/analyze-security', async (req, res) => {
  try {
    // Validate request body
    const validation = SecuritySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input format or payload too large.', details: validation.error.format() });
    }

    const { prompt, languageName } = validation.data;
    const targetLang = languageName || 'English';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from environment variables.' });
    }

    if (containsInjection(prompt)) {
      console.warn(`[SECURITY] Blocked a potential prompt injection in /api/analyze-security`);
      return res.status(400).json({ error: 'Your request contains prohibited terms or patterns.' });
    }

    const systemPrompt = `You are Matdan Mitra, a specialized Security Intelligence AI for election safety. Your ONLY purpose is to provide risk levels and recommendations for election security based on provided data. 

LANGUAGE DIRECTIVE:
1. The 'recommendations' array MUST be written ENTIRELY in ${targetLang} script and grammar.
2. Do NOT use English script (Romanized/transliterated) for ${targetLang}. 
3. If ${targetLang} is 'Odia', you MUST use the Odia script (e.g., ସିଆରପିଏଫ୍ instead of CRPF, ସିସିଟିଭି instead of CCTV). 
4. Every single word, number, and character in every recommendation string must use the ${targetLang} script.
5. Example of pure Odia tone and script: "ସୁରକ୍ଷା ବୃଦ୍ଧି ପାଇଁ ଅତିରିକ୍ତ ପୋଲିସ ବାହିନୀ ନିୟୋଜିତ କରନ୍ତୁ।"
6. Avoid transliteration like "Security brudhi pai..." - this is strictly forbidden. Use the actual script.

JSON FORMAT: Respond in pure JSON format containing exactly two fields: 'riskLevel' (number 1-10) and 'recommendations' (an array of strings).`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      let geminiErrorMsg = `Gemini API responded with status ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody.error && errorBody.error.message) {
          geminiErrorMsg = errorBody.error.message;
        }
      } catch (e) { }
      throw new Error(geminiErrorMsg);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsedResult = JSON.parse(resultText);

    res.json(parsedResult);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    // Validate request body
    const validation = ChatSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid chat history or payload too large.', details: validation.error.format() });
    }

    const { messages } = validation.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from environment variables.' });
    }

    // Sanitize ONLY the latest user message to prevent "Poisoned History" blocking the whole session
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage && containsInjection(lastUserMessage.content)) {
      console.warn(`[SECURITY] Blocked a potential prompt injection in /api/chat`);
      return res.status(400).json({ error: 'Your message was flagged for safety violations.' });
    }

    // Extract system message — Gemini requires it in system_instruction, NOT in contents[]
    const systemMessage = messages.find(m => m.role === 'system');

    // Convert non-system messages to Gemini format, filtering out any "poisoned" messages
    const geminiMessages = messages
      .filter(m => m.role !== 'system' && !containsInjection(m.content))
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const requestBody = { contents: geminiMessages };
    if (systemMessage) {
      requestBody.system_instruction = { parts: [{ text: systemMessage.content }] };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let geminiErrorMsg = `Gemini API responded with status ${response.status}`;
      try {
        const errorBody = await response.json();
        if (errorBody.error && errorBody.error.message) {
          geminiErrorMsg = errorBody.error.message;
        }
      } catch (e) { }
      throw new Error(geminiErrorMsg);
    }

    const data = await response.json();
    res.json({ reply: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Security Proxy Server running on port ${port}`);
});
