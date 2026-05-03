# Matdan Mitra

A scalable, multi-lingual, AI-driven platform built to streamline voter registration, educate citizens on the democratic process, and provide predictive election security intelligence — all powered by Google Gemini.
---
🔗 **Live Demo**: [https://matdan-mitra-546720462040.asia-south2.run.app](https://matdan-mitra-546720462040.asia-south2.run.app)

## 🤖 The Agentic Workflow
This application was architected and built using an **Advanced Agentic AI Workflow**. Instead of writing code manually line-by-line, an AI pair-programmer (Antigravity) iteratively gathered requirements, generated implementation plans, modified the DOM, wrote tests, and rapidly prototyped features. This approach enables moving from concept to a highly polished, robust, multi-lingual production application in a fraction of the time.

---

## ✨ Core Features

### 🗳️ Voter Registration Journey
A guided, multi-step wizard that walks citizens through the entire voter registration process:
- **Eligibility Checker**: Validates age (18+) and citizenship before proceeding.
- **Smart Form Routing**: Automatically determines whether the user needs Form 6 (Resident) or Form 6A (NRI) based on their residency status.
- **Document Checklist**: Displays the exact documents required (Aadhaar, PAN, Passport, etc.) based on the user's profile.
- **Document Upload**: Supports multi-file upload (PDF, PNG, JPG) with a live file preview.
- **Submission Tracking**: Generates a unique reference ID (`MM-YEAR-XXXX`) and stores it in the Admin panel for review.

### 🤖 AI Voter Guide Chatbot
A conversational AI assistant powered by **Google Gemini 2.5 Flash** that helps citizens navigate the voting process:
- Answers questions about election dates, registration deadlines, required documents, polling station information, and eligibility criteria.
- **Fully Multi-lingual**: Responds natively in whichever of the 5 supported languages the user has selected (English, Hindi, Telugu, Tamil, or Odia).
- **Multi-turn Conversation**: Maintains full chat history to provide contextually relevant follow-up answers.
- Built on a hardened backend proxy — the API key is never exposed to the browser.

### 🛡️ AI Security Intelligence (Predictive Risk Analysis)
An admin-facing module that uses **Google Gemini 2.5 Flash** with a **RAG (Retrieval-Augmented Generation)** approach to assess election security risk:
- **Data Grounding**: The AI is grounded with structured historical incident data (`data_schema.json`) for the selected region — including past polling violence, EVM malfunctions, and procedural disruptions — preventing hallucination and anchoring responses in real-world context.
- **⚠️ Static Dataset Note**: The current version uses a curated static JSON dataset (`data_schema.json`) as the knowledge base. This is intentional for the demo — it provides consistent, reproducible results. Real-time data ingestion from live news APIs is planned in the next phase (see Roadmap).
- **Risk Scoring**: Produces a **Safety Index** (1–10) for any of India's 28 States and 8 Union Territories.
- **Actionable Recommendations**: Generates exactly 5 specific deployment strategies (CRPF levels, CCTV density, drone surveillance) written in the user's native script.
- **Result Caching**: Caches results per location per language in Zustand to avoid redundant API calls.

### 📚 Election Process Timeline
An interactive, animated educational guide that walks citizens through every phase of an Indian election — from the official notification to vote counting — making the democratic process transparent and accessible.

### 📋 Admin: User Applications
A live dashboard that displays all submitted voter registration applications, showing reference IDs, submission timestamps, uploaded document names, and current review status.

---

## 📈 Scalability: National Architecture
- **5-Language Localization**: Full native support for English, Hindi, Telugu, Tamil, and Odia via `react-i18next`. Every UI string, number, and AI recommendation is rendered in the user's chosen script. Architected to scale to all 22 scheduled Indian languages.
- **Language Persistence**: The selected language survives page refresh via Zustand `persist` + localStorage.
- **Microservice Ready**: The Node.js backend proxy (`server.js`) abstracts all AI API calls, ensuring the frontend never exposes secrets. Fully architected for **Google Cloud Run** deployment.

---

## 🔒 Security Hardening & Production Readiness
This project has been hardened with multiple industrial-grade security layers:

- **Prompt Injection Defense**: Multi-layered regex pattern recognition blocks jailbreak attempts, role-switching, and instruction overrides before they reach the LLM.
- **API Rate Limiting**: `express-rate-limit` restricts each IP to 10 requests per minute, protecting against Denial-of-Wallet attacks and bot spam.
- **Input Validation**: `Zod` schema validation on all API payloads prevents malformed data and enforces strict type safety.
- **CORS Lockdown**: Restricted to `localhost` and `*.a.run.app` patterns only, mitigating CSRF risks.
- **Secure HTTP Headers**: `Helmet` middleware automatically sets 15+ security headers (XSS protection, Clickjacking prevention, HSTS, etc.).
- **No Sensitive Logging**: User prompts and AI responses are never stored or printed in plain text in production.
- **Dynamic Environment Config**: Seamlessly switches between development (`localhost:3002`) and production (Cloud Run URL) via environment variables.

---

## 🚀 Running the Demo

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API key to .env
GEMINI_API_KEY="your_key_here"

# 3. Start the app (frontend + backend concurrently)
npm run dev
```
The app runs on `http://localhost:5173` with the backend proxy on `http://localhost:3002`.

### Resetting Demo State
The app persists submissions and AI security cache in `localStorage` so they survive page refreshes. To start fresh before a demo run, paste this in the browser console (**F12 → Console**):
```js
localStorage.removeItem('matdan-mitra-storage');
location.reload();
```

---

## 🛠️ Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Zustand
- **Backend/Proxy**: Node.js, Express, Helmet, Zod, Express-Rate-Limit
- **AI Integration**: Google Gemini 2.5 Flash API
- **Localization**: react-i18next (EN, HI, TE, TA, OR)

---

## 🔮 Future Scope & Roadmap
Matdan Mitra is designed to be a living platform. Planned future enhancements include:

- **Persistent Database Integration**: Transitioning from in-memory Zustand storage to a robust production database (PostgreSQL/Supabase) for permanent data persistence.
- **Real-Time Incident Streaming via News APIs**: The current security module uses a static historical dataset for RAG grounding. The next evolution is to replace this with a live pipeline — integrating with news APIs (e.g., [NewsAPI.org](https://newsapi.org), [GDELT Project](https://www.gdeltproject.org/), or [Indian Express RSS feeds](https://indianexpress.com/)) to fetch recent election-related incident reports, parse and embed them in real-time, and use them as dynamic RAG context. This would make the risk scores genuinely current and event-aware, not just historically informed.
- **Blockchain for Election Integrity**: Implementing a decentralized ledger to ensure voter registration records are immutable and transparent.
- **Offline-First PWA**: Enabling offline registration capabilities for rural areas with intermittent connectivity, with background sync when back online.
- **Voice-Driven Multi-lingual Assistant**: Expanding the AI chatbot to support voice commands in all 22 scheduled Indian languages for increased accessibility.
- **Advanced Geospatial Analytics**: Integrating interactive heatmaps to visualize security deployments and risk zones across different constituencies.
