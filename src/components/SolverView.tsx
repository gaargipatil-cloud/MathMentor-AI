import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MultiAgentSolveResult } from '../types/mathmentor.js';
import { AgentWorkflowAnimation } from './AgentWorkflowAnimation.js';
import { SolutionResultView } from './SolutionResultView.js';

interface SolverViewProps {
  initialProblem?: string;
  isDemoMode: boolean;
  onLogAttemptToDb: (attempt: any) => void;
  onNavigateToThinking?: (problem: string) => void;
  onNavigateToSocratic?: (problem: string) => void;
  onNavigateToHandwritten?: () => void;
}

export const SolverView: React.FC<SolverViewProps> = ({
  initialProblem = '',
  isDemoMode,
  onLogAttemptToDb,
  onNavigateToThinking,
  onNavigateToSocratic,
  onNavigateToHandwritten
}) => {
  const [problemText, setProblemText] = useState<string>(initialProblem || '2x + 5 = 17');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [viewState, setViewState] = useState<'input' | 'processing' | 'result'>('input');
  const [solveResult, setSolveResult] = useState<MultiAgentSolveResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialProblem) {
      setProblemText(initialProblem);
    }
  }, [initialProblem]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleStartAnalysis = async () => {
    if (!problemText.trim() && !imageBase64) {
      setErrorMsg('Please enter a mathematics problem or upload an image.');
      return;
    }

    setErrorMsg(null);
    setViewState('processing');

    try {
      // Call backend API or local demo fallback
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: problemText.trim(),
          imageBase64: imageBase64 || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Server response failed');
      }

      const data: MultiAgentSolveResult = await response.json();
      setSolveResult(data);
    } catch (err: any) {
      console.warn('API call error, falling back to local demo solver engine:', err);
      // Fallback demo engine
      const fallbackRes = await fetch(`/api/solve/demo?q=${encodeURIComponent(problemText)}`);
      const data = await fallbackRes.json();
      setSolveResult(data);
    }
  };

  const handleWorkflowComplete = () => {
    setViewState('result');
  };

  const handleReset = () => {
    setViewState('input');
    setSolveResult(null);
    setImageBase64(null);
  };

  if (viewState === 'processing') {
    return <AgentWorkflowAnimation onComplete={handleWorkflowComplete} />;
  }

  if (viewState === 'result' && solveResult) {
    return (
      <SolutionResultView
        result={solveResult}
        onSolveAnother={handleReset}
        onNavigateToThinking={onNavigateToThinking}
        onNavigateToSocratic={onNavigateToSocratic}
        onLogAttempt={(correct, mistakeType) => {
          onLogAttemptToDb({
            problem_text: solveResult.problem,
            topic: solveResult.analysis.topic,
            difficulty: solveResult.analysis.difficulty,
            correct,
            solving_time_sec: solveResult.methods[0]?.estimated_time_sec || 35,
            mistake_type: mistakeType
          });
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-cyan-400" />
          AI Mathematics Solver
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Enter an equation, algebraic problem, or word problem. Our multi-agent AI engine will evaluate, verify, and find the optimal solution.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        {/* Text Input Area */}
        <div className="space-y-2">
          <label htmlFor="problem-textarea" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Enter Mathematics Problem:
          </label>
          <textarea
            id="problem-textarea"
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            rows={4}
            placeholder="Type your math equation e.g., 2x + 5 = 17, x^2 - 5x + 6 = 0, or word problem..."
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-base focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none resize-none"
          />
        </div>

        {/* Preset Sample Bar */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">Or choose a preloaded example:</span>
          <div className="flex flex-wrap gap-2">
            <button
              id="preset-btn-1"
              onClick={() => {
                setProblemText('2x + 5 = 17');
                setImageBase64(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              2x + 5 = 17 (Linear)
            </button>
            <button
              id="preset-btn-2"
              onClick={() => {
                setProblemText('x^2 - 5x + 6 = 0');
                setImageBase64(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              x² - 5x + 6 = 0 (Quadratic)
            </button>
            <button
              id="preset-btn-3"
              onClick={() => {
                setProblemText('Find the area of a circle with radius 7 cm');
                setImageBase64(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              Area of Circle (r=7 cm)
            </button>
          </div>
        </div>

        {/* Upload Image / OCR */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Optionally Attach Image / Scan:
          </label>
          <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-6 text-center bg-slate-950/50 transition-colors">
            <input
              id="image-file-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {imageBase64 ? (
              <div className="flex items-center justify-center gap-3">
                <img
                  src={imageBase64}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-cyan-500"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-cyan-400 block">✓ Image attached</span>
                  <span className="text-[11px] text-slate-400">Click or drag another to replace</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">
                  Drag & drop an image or <span className="text-cyan-400 font-bold">browse files</span>
                </p>
                <p className="text-[11px] text-slate-500">Supports PNG, JPG, JPEG (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Submit Button */}
        <button
          id="analyze-problem-btn"
          onClick={handleStartAnalysis}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <Sparkles className="w-5 h-5 fill-current" />
          Analyze Problem With AI Agents
        </button>

        {/* Alternative Learning Modes */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 text-xs">
          {onNavigateToThinking && (
            <button
              onClick={() => onNavigateToThinking(problemText)}
              className="text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🧠 Have steps? Check your Thinking Path</span>
            </button>
          )}
          {onNavigateToSocratic && (
            <button
              onClick={() => onNavigateToSocratic(problemText)}
              className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>💬 Want hints without full answers? Ask Socratic Tutor</span>
            </button>
          )}
          {onNavigateToHandwritten && (
            <button
              onClick={onNavigateToHandwritten}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>📷 Have notebook photo? Scan Handwritten Work</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
