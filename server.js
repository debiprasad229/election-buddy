import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;

// Trust proxy headers (required for Cloud Run so rate limiter uses real client IP)
app.set('trust proxy', true);

// --- SECURITY: BASE HARDENING ---
app.use(helmet()); // Sets various HTTP headers for security (XSS, Clickjacking, etc.)
// --------------------------------

// --- SECURITY: CORS RESTRICTION ---
const allowedOrigins = [
  'http://localhost:5173', // Local Vite development
  /https?:\/\/.*\.run\.app$/ // Google Cloud Run production domains
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

app.use(express.json({ limit: '10mb' }));

// Configure multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Security middleware: Checks for prompt injection patterns.
 * @param {string} text - The input text to check.
 * @returns {boolean} True if injection is detected.
 */
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
export { forbiddenPatterns };

const containsInjection = (text) => {
  if (typeof text !== 'string') return false;
  return forbiddenPatterns.some(pattern => pattern.test(text));
};
export { containsInjection };
// ------------------------------------------

// --- SECURITY: RATE LIMITING ---
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per minute
  message: { error: 'Too many requests. Please wait a moment and try again.' },
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

    const languageDirectives = {
      'Odia': `
1. The 'recommendations' array MUST be written ENTIRELY in Odia script and grammar.
2. Use the Odia script (e.g., ସିଆରପିଏଫ୍ instead of CRPF, ସିସିଟିଭି instead of CCTV). 
3. Every single word, number, and character in every recommendation string must use the Odia script.
4. Example of pure Odia tone and script: "ସୁରକ୍ଷା ବୃଦ୍ଧି ପାଇଁ ଅତିରିକ୍ତ ପୋଲିସ ବାହିନୀ ନିୟୋଜିତ କରନ୍ତୁ।"
5. Avoid transliteration like "Security brudhi pai..." - this is strictly forbidden. Use the actual script.`,
      'English': `
1. The 'recommendations' array MUST be written ENTIRELY in English.
2. Use standard English script and professional governance terminology.
3. Every single word and number in the recommendations array must be in English.`,
      'Hindi': `
1. The 'recommendations' array MUST be written ENTIRELY in Hindi (Devanagari script).
2. Use professional Hindi terminology for governance and security.`,
      'Telugu': `
1. The 'recommendations' array MUST be written ENTIRELY in Telugu script.`,
      'Tamil': `
1. The 'recommendations' array MUST be written ENTIRELY in Tamil script.`
    };

    const targetDirective = languageDirectives[targetLang] || `
1. The 'recommendations' array MUST be written ENTIRELY in ${targetLang} script and grammar.
2. Use the native script of ${targetLang} for all words and numbers.`;

    const systemPrompt = `You are Matdan Mitra, a specialized Security Intelligence AI for election safety. Your ONLY purpose is to provide risk levels and recommendations for election security based on provided data. 

LANGUAGE DIRECTIVE:
${targetDirective}

JSON FORMAT: Respond in pure JSON format containing exactly two fields: 'riskLevel' (number 1-10) and 'recommendations' (an array of strings).`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: systemPrompt }] },
        tools: [{ google_search: {} }],
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
    requestBody.tools = [{ google_search: {} }];

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

// --- STATIC FILES & SPA ROUTING ---
app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// ------------------------------------

/**
 * AI Document Verification Endpoint
 * Uses Gemini Vision to analyze uploaded documents for authenticity.
 */
app.post('/api/verify-document', upload.single('document'), async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('API Key missing');
    if (!req.file) return res.status(400).json({ error: 'No document uploaded' });

    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const prompt = "You are an official election document verifier. Analyze this image. Is it a valid Indian identity document (like Aadhaar, PAN, or Passport) for voter registration? Respond with a JSON object: { 'is_valid': boolean, 'reason': 'short explanation', 'document_type': 'string' }";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) throw new Error('Gemini API Error');
    const data = await response.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);

    res.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.listen(port, () => {
  console.log(`Security Proxy Server running on port ${port}`);
});
