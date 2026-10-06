import React, { useState } from 'react';
import { Header, ActiveNavTab } from './components/Header.js';
import { LandingPage } from './components/LandingPage.js';
import { SolverView } from './components/SolverView.js';
import { DashboardView } from './components/DashboardView.js';
import { ThinkingPathAnalyzerView } from './components/ThinkingPathAnalyzerView.js';
import { SocraticTutorView } from './components/SocraticTutorView.js';
import { HandwrittenAnalyzerView } from './components/HandwrittenAnalyzerView.js';
import { AICoachDrawer } from './components/AICoachDrawer.js';
import { Sparkles, Bot } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('landing');
  const [activeProblem, setActiveProblem] = useState<string>('2x + 5 = 17');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(false);

  const handleStartSolving = (presetProblem?: string) => {
    if (presetProblem) {
      setActiveProblem(presetProblem);
    }
    setActiveTab('solver');
  };

  const handleLogAttempt = async (attempt: {
    problem_text: string;
    topic: string;
    difficulty: string;
    correct: boolean;
    solving_time_sec: number;
    mistake_type?: string;
  }) => {
    try {
      await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt)
      });
    } catch (err) {
      console.warn('Attempt logging error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        onOpenCoach={() => setIsCoachOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'landing' && (
          <LandingPage
            onStartSolving={handleStartSolving}
            onViewDashboard={() => setActiveTab('dashboard')}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'solver' && (
          <SolverView
            initialProblem={activeProblem}
            isDemoMode={isDemoMode}
            onLogAttemptToDb={handleLogAttempt}
            onNavigateToThinking={(prob) => {
              setActiveProblem(prob);
              setActiveTab('thinking');
            }}
            onNavigateToSocratic={(prob) => {
              setActiveProblem(prob);
              setActiveTab('socratic');
            }}
            onNavigateToHandwritten={() => setActiveTab('handwritten')}
          />
        )}

        {activeTab === 'thinking' && (
          <ThinkingPathAnalyzerView
            initialProblem={activeProblem}
            onNavigateToSolver={(prob) => {
              setActiveProblem(prob);
              setActiveTab('solver');
            }}
            onNavigateToSocratic={(prob) => {
              setActiveProblem(prob);
              setActiveTab('socratic');
            }}
          />
        )}

        {activeTab === 'socratic' && (
          <SocraticTutorView
            initialProblem={activeProblem}
            onSolveInMultiAgent={(prob) => {
              setActiveProblem(prob);
              setActiveTab('solver');
            }}
            onAnalyzeThinking={(prob) => {
              setActiveProblem(prob);
              setActiveTab('thinking');
            }}
          />
        )}

        {activeTab === 'handwritten' && (
          <HandwrittenAnalyzerView
            onPracticeRemediation={(prob) => {
              setActiveProblem(prob);
              setActiveTab('solver');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onPracticeProblem={(probText) => {
              setActiveProblem(probText);
              setActiveTab('solver');
            }}
            onOpenCoach={() => setIsCoachOpen(true)}
            onAnalyzeThinking={(probText) => {
              setActiveProblem(probText);
              setActiveTab('thinking');
            }}
          />
        )}
      </main>

      {/* Floating Ask MathMentor AI Coach Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="floating-ask-coach-btn"
          onClick={() => setIsCoachOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-2xl shadow-indigo-500/40 border border-white/20 transition-all transform hover:-translate-y-1 cursor-pointer"
        >
          <Bot className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Ask MathMentor</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300"></span>
          </span>
        </button>
      </div>

      {/* Persistent AI Coach Drawer */}
      <AICoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        onNavigateToAction={(action, payload) => {
          if (action === 'solve') {
            setActiveProblem(payload);
            setActiveTab('solver');
          } else if (action === 'thinking') {
            setActiveProblem(payload);
            setActiveTab('thinking');
          }
          setIsCoachOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">MathMentor AI</span> — Cognitive Mathematics Learning Engine
          </div>
          <div className="text-slate-400">
            “Don’t just solve the problem. Learn how to think.”
          </div>
        </div>
      </footer>
    </div>
  );
}
