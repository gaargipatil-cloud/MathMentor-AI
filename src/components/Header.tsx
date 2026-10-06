import React from 'react';
import {
  Brain,
  Sparkles,
  LayoutDashboard,
  Calculator,
  Compass,
  MessageSquareCode,
  Camera,
  PlayCircle
} from 'lucide-react';

export type ActiveNavTab = 'landing' | 'solver' | 'thinking' | 'socratic' | 'handwritten' | 'dashboard';

interface HeaderProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onOpenCoach?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  setIsDemoMode,
  onOpenCoach
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          id="header-logo-button"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                MathMentor<span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Cognitive Coach
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Don't just solve. Learn how to think.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
          <button
            id="nav-home-btn"
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            How MathMentor Thinks
          </button>

          <button
            id="nav-solver-btn"
            onClick={() => setActiveTab('solver')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'solver'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Multi-Agent Solver
          </button>

          <button
            id="nav-thinking-btn"
            onClick={() => setActiveTab('thinking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'thinking'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Thinking Path Analyzer
          </button>

          <button
            id="nav-socratic-btn"
            onClick={() => setActiveTab('socratic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'socratic'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5 text-indigo-400" />
            Socratic Tutor
          </button>

          <button
            id="nav-handwritten-btn"
            onClick={() => setActiveTab('handwritten')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'handwritten'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            Scan Work
          </button>

          <button
            id="nav-dashboard-btn"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
        </nav>

        {/* Mobile / Tablet Nav Dropdown or Compact Switcher */}
        <div className="flex lg:hidden items-center">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as ActiveNavTab)}
            className="bg-slate-800 text-slate-200 text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="landing">How MathMentor Thinks</option>
            <option value="solver">Multi-Agent Solver</option>
            <option value="thinking">Thinking Path Analyzer</option>
            <option value="socratic">Socratic Tutor</option>
            <option value="handwritten">Scan Work</option>
            <option value="dashboard">Dashboard</option>
          </select>
        </div>

        {/* Controls & Demo Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Demo Mode:</span>
            <button
              id="demo-mode-toggle"
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                isDemoMode ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
              title="Toggle Preloaded Demo vs Live Gemini AI"
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isDemoMode ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-semibold text-[11px] hidden sm:inline ${isDemoMode ? 'text-cyan-400' : 'text-slate-400'}`}>
              {isDemoMode ? 'ON' : 'LIVE'}
            </span>
          </div>

          {onOpenCoach && (
            <button
              id="nav-ask-coach-btn"
              onClick={onOpenCoach}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">AI Coach</span>
            </button>
          )}

          <button
            id="quick-start-btn"
            onClick={() => setActiveTab('solver')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Solve Now
          </button>
        </div>
      </div>
    </header>
  );
};

