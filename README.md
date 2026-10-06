# MathMentor AI — Smart India Hackathon (SIH) Prototype

> **“Don’t just solve the problem. Learn how to think.”**

MathMentor AI is an agentic AI-based personalized mathematics learning platform designed to revolutionize STEM education. Instead of acting like a simple answer generator or chatbot clone, MathMentor orchestrates **8 specialized AI agents** that analyze, solve, benchmark, verify, and personalize math learning.

---

## 🏆 SIH Hackathon Value Proposition

In typical hackathons, AI math apps act as simple LLM wrappers. MathMentor AI differentiates itself through:

1. **Visible Multi-Agent Workflow**: Users watch specialized agents collaborate live in the UI.
2. **Speed & Efficiency Benchmark**: Compares multiple solution methods (Standard vs. Speed Shortcut) and explains step/time reductions.
3. **Symbolic Verification Engine**: Combines Gemini AI reasoning with MathJS/SymPy exact symbolic evaluation to eliminate AI hallucinations.
4. **SQLite Learning DNA**: Tracks mistake patterns (e.g., sign errors in linear equations) and crafts adaptive daily practice missions.
5. **Fail-Proof SIH Demo Mode**: Includes preloaded multi-agent responses so presentation demos never fail due to internet latency or missing keys.

---

## 🧠 Multi-Agent Architecture

```
                      [ Student Math Input ]
                                |
                      [ 🧠 Problem Analyzer ]
                                |
        +-----------------------+-----------------------+
        |                                               |
[ 📐 Standard Solver ]                        [ ⚡ Speed Agent ]
(Method A - Full steps)                     (Method B - Shortcut)
        |                                               |
        +-----------------------+-----------------------+
                                |
                    [ 🔍 Verification Agent ]
                 (MathJS Symbolic Verification)
                                |
                       [ ⚖️ Judge Agent ]
                     (Scoring out of 100)
                                |
                [ 🎯 Personalization Agent ]
              (SQLite History & Mistake Replay)
                                |
                       [ 💡 Hint Agent ]
                    (Progressive 3-Tier Hints)
```

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Motion
* **Backend**: Express.js (Node.js / TypeScript)
* **AI Engine**: `@google/genai` (Gemini 3.6 Flash)
* **Mathematics Verification**: MathJS symbolic expression evaluator
* **Database**: SQLite (`sql.js` pure JS embedded database with file persistence)

---

## 📁 Project Structure

```
mathmentor-ai/
├── server.ts                    # Express full-stack entry point & API endpoints
├── mathmentor.sqlite            # SQLite database for storing student attempts & mistakes
├── package.json                 # Node dependencies & build scripts
├── requirements.txt             # Python requirements reference
├── .env.example                 # Environment variables template
├── README.md                    # Detailed documentation & SIH demo flow
│
├── src/
│   ├── App.tsx                  # Main application component & navigation router
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Tailwind CSS imports & custom styles
│   │
│   ├── types/
│   │   └── mathmentor.ts        # TypeScript interfaces for problems, agents, DB stats
│   │
│   ├── db/
│   │   └── database.ts          # SQLite initialization, schema creation, seed data & queries
│   │
│   ├── services/
│   │   └── geminiService.ts     # Multi-Agent orchestrator, Gemini API SDK & Demo Mode fallback
│   │
│   └── components/
│       ├── Header.tsx           # Navigation header & Demo Mode toggle
│       ├── LandingPage.tsx      # Hero section, feature cards & "How MathMentor Thinks"
│       ├── SolverView.tsx       # Problem input, image upload & demo presets
│       ├── AgentWorkflowAnimation.tsx # Live animated multi-agent processing pipeline
│       ├── SolutionResultView.tsx     # Method comparison matrix, steps, hints & mistake callouts
│       └── DashboardView.tsx    # Intelligence KPIs, Math DNA meters, Mistake Replay & Daily Mission
```

---

## 🚀 Installation & Local Running

### Prerequisites
* Node.js v18+ installed

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Inside `.env`, set your Gemini API key:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### Step 3: Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 🧪 SIH Demo Test Cases

### Test Case 1: Linear Equation
* **Input**: `2x + 5 = 17`
* **Expected Output**:
  * **Result**: `x = 6`
  * **Method A (Standard)**: 4 steps, 45 seconds.
  * **Method B (Speed Shortcut)**: 2 steps, 15 seconds.
  * **Verification**: MathJS verifies `2(6) + 5 = 17`.

### Test Case 2: Quadratic Equation
* **Input**: `x^2 - 5x + 6 = 0`
* **Expected Output**:
  * **Result**: `x = 2 or x = 3`
  * **Recommended**: Factoring Method (35s) over Quadratic Formula (75s).

### Test Case 3: Circle Area (Geometry)
* **Input**: `Find the area of a circle with radius 7 cm`
* **Expected Output**:
  * **Result**: `154 cm²`
  * **Speed Insight**: Explains why using fractional $\pi = 22/7$ saves 35 seconds over decimal multiplication.

---

## 🎬 3-Minute SIH Demo Script for Judges

1. **Introduction (30s)**:
   - Open **MathMentor AI** landing page.
   - Highlight subtitle: *"Don't just solve the problem. Learn how to think."*
   - Scroll to **"How MathMentor Thinks"** section and click through the 6 stages to demonstrate agentic architecture.

2. **AI Solver Demonstration (60s)**:
   - Click **Start Solving** or select preloaded preset `2x + 5 = 17`.
   - Click **Analyze Problem With AI Agents**.
   - Watch the **Live Agent Workflow Animation** as Problem Analyzer, Solver, Speed Agent, Verifier, Judge, Personalization, and Hint agents complete in real-time.

3. **Solution Matrix & Hints (40s)**:
   - Show the **AI Recommended Method** vs. **Comparison Matrix**.
   - Point out the **"Why Judge Agent Recommended This"** box.
   - Click **Need A Hint** to show progressive 3-tier hints (Hint 1 -> Hint 2 -> Hint 3).
   - Click **Mark Solved Correctly!** to save attempt into SQLite.

4. **Personalized Intelligence Dashboard (50s)**:
   - Click **Intelligence Dashboard**.
   - Show updated **Accuracy** (92%), **Avg Solving Time**, and **Math Learning DNA** meters.
   - Show **Mistake Replay** section highlighting past sign errors.
   - Point out **Today's Mission** with adaptive practice questions.

---

## 🔮 Future Scope

* **Voice Assistant**: Natural voice interaction with Gemini Live API.
* **OCR Camera Scan**: Real-time camera stream problem capture.
* **Teacher Classroom Analytics**: Class-wide weakness heatmaps for schools.
* **Multilingual Coaching**: Support for 12 regional Indian languages.
