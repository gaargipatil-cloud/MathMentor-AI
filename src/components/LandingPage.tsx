import React, { useState } from 'react';
import {
  Brain,
  Zap,
  Target,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Scale,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onStartSolving: (presetProblem?: string) => void;
  onViewDashboard: () => void;
  onNavigateToTab?: (tab: 'solver' | 'thinking' | 'socratic' | 'handwritten') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartSolving,
  onViewDashboard,
  onNavigateToTab
}) => {
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<number>(0);

  const workflowSteps = [
    {
      num: 1,
      name: "Student Input",
      agent: "Student / Camera OCR",
      desc: "Student inputs a problem via typed text, LaTeX math, or handwritten photo scan.",
      detail: "Supports algebraic expressions, word problems, geometric formulas, and camera OCR scans."
    },
    {
      num: 2,
      name: "Understand",
      agent: "🧠 Problem Analyzer",
      desc: "Identifies mathematical topic, subtopic, concepts, and difficulty.",
      detail: "Categorizes problem (e.g., Algebra -> Linear Equation) and computes estimated standard solving time."
    },
    {
      num: 3,
      name: "Solve",
      agent: "📐 Solver Agents",
      desc: "Generates multiple independent solution methods (Standard & Alternative).",
      detail: "Algebra Solver produces standard steps; Alternative Solver produces visual or substitution methods."
    },
    {
      num: 4,
      name: "Verify",
      agent: "🔍 Verification Agent",
      desc: "Cross-checks mathematical validity using MathJS symbolic engine.",
      detail: "Evaluates left-hand vs right-hand side equalities to guarantee 100% mathematical accuracy."
    },
    {
      num: 5,
      name: "Compare & Optimize",
      agent: "⚡ Speed & Judge Agents",
      desc: "Evaluates operations, speed, and simplicity to select the best method.",
      detail: "Judge Agent scores each method out of 100 on steps, speed, and student-friendliness."
    },
    {
      num: 6,
      name: "Personalize & Learn",
      agent: "🎯 Personalization & Hint Agent",
      desc: "Retrieves SQLite performance history to highlight mistakes & guide student.",
      detail: "Stores attempt accuracy, identifies sign error habits, and provides progressive 3-tier hints."
    }
  ];

  return (
    <div className="space-y-16 py-8">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 text-center">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Agentic AI Mathematics Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            MathMentor <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-cyan-300/90 italic">
            “Don’t just solve the problem. Learn how to think.”
          </p>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your personal AI mathematics coach that analyzes your thinking, finds faster solutions, diagnoses misconceptions, and creates a personalized learning path.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="hero-start-solving-btn"
              onClick={() => onStartSolving()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Solving Problems
            </button>

            {onNavigateToTab && (
              <button
                id="hero-thinking-btn"
                onClick={() => onNavigateToTab('thinking')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Brain className="w-5 h-5 text-indigo-400" />
                Analyze My Thinking
              </button>
            )}

            <button
              id="hero-view-dashboard-btn"
              onClick={onViewDashboard}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              View Dashboard
            </button>
          </div>

          {/* Quick Demo Launches */}
          <div className="pt-6 border-t border-slate-800/80 max-w-xl mx-auto">
            <p className="text-xs text-slate-400 font-medium mb-3">⚡ Try preloaded demo questions:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                id="demo-preset-linear"
                onClick={() => onStartSolving('2x + 5 = 17')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              >
                2x + 5 = 17
              </button>
              <button
                id="demo-preset-quadratic"
                onClick={() => onStartSolving('x^2 - 5x + 6 = 0')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              >
                x² - 5x + 6 = 0
              </button>
              <button
                id="demo-preset-geometry"
                onClick={() => onStartSolving('Find the area of a circle with radius 7 cm')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              >
                Area of Circle (r=7)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 CORE FEATURE CARDS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why MathMentor AI is Different</h2>
          <p className="text-slate-400 text-sm">Unlike generic chatbot clones, MathMentor uses specialized collaborative AI agents to verify and optimize learning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">🧠 Multi-Agent Solving</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Multiple specialized AI agents collaborate in parallel to analyze, solve, verify, and judge mathematical solutions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">⚡ Faster Methods</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Speed Optimization Agent identifies operation shortcuts, comparing time and step counts to teach exam efficiency.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">🎯 Thinking Path Diagnostics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pinpoints exactly where your thinking broke down, diagnosing misconceptions like sign flips or missed brackets.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">📊 Progress Intelligence</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Visualizes Math Learning DNA, speed trends, topic strength radar, and mistake replay challenges.
            </p>
          </div>
        </div>
      </section>

      {/* HOW MATHMENTOR THINKS */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            Collaborative Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How MathMentor Thinks</h2>
          <p className="text-slate-400 text-sm">
            Explore our collaborative multi-agent decision loop below. Click any step to understand how each agent reasons:
          </p>
        </div>

        {/* Step Flow Pipeline */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {workflowSteps.map((s, idx) => {
            const isSelected = selectedWorkflowStep === idx;
            return (
              <button
                key={s.num}
                id={`agent-step-btn-${s.num}`}
                onClick={() => setSelectedWorkflowStep(idx)}
                className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-cyan-400 shadow-lg shadow-cyan-500/10 text-white'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 text-[11px] font-bold text-cyan-400 flex items-center justify-center">
                    {s.num}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="font-bold text-sm text-white">{s.name}</div>
                <div className="text-[11px] text-cyan-300/80 truncate mt-1">{s.agent}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detail Inspector */}
        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono">
                STAGE {workflowSteps[selectedWorkflowStep].num} / 6
              </span>
              <h3 className="text-lg font-bold text-white">
                {workflowSteps[selectedWorkflowStep].agent} ({workflowSteps[selectedWorkflowStep].name})
              </h3>
            </div>
            <p className="text-slate-300 text-sm font-medium">
              {workflowSteps[selectedWorkflowStep].desc}
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              💡 <span className="font-semibold text-slate-300">Technical Detail:</span> {workflowSteps[selectedWorkflowStep].detail}
            </p>
          </div>

          <button
            id="try-solver-now"
            onClick={() => onStartSolving()}
            className="shrink-0 px-6 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            See Live In Solver
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
