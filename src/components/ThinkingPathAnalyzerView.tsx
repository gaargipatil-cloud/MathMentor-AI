import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Lightbulb,
  Zap,
  BookmarkCheck,
  Scale,
  Compass,
  FileText,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { ThinkingAnalysisResult } from '../types/mathmentor.js';

interface ThinkingPathAnalyzerViewProps {
  initialProblem?: string;
  onNavigateToSocratic?: (problem: string) => void;
  onNavigateToSolver?: (problem: string) => void;
}

export const ThinkingPathAnalyzerView: React.FC<ThinkingPathAnalyzerViewProps> = ({
  initialProblem = '',
  onNavigateToSocratic,
  onNavigateToSolver
}) => {
  const [problemText, setProblemText] = useState<string>(initialProblem || '2x + 5 = 17');
  const [studentSteps, setStudentSteps] = useState<string>(
    '2x + 5 = 17\n2x = 17 + 5\n2x = 22\nx = 11'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ThinkingAnalysisResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [challengeAnswer, setChallengeAnswer] = useState<string>('');
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialProblem) {
      setProblemText(initialProblem);
    }
  }, [initialProblem]);

  // Clean up speech when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Quick Demo Presets
  const presets = [
    {
      title: 'Transposition Sign Error',
      subtitle: 'Prompt Signature Case: 2x + 5 = 17',
      problem: '2x + 5 = 17',
      steps: '2x + 5 = 17\n2x = 17 + 5\n2x = 22\nx = 11',
      tag: 'Inverse Operations'
    },
    {
      title: 'Parentheses Distribution Omission',
      subtitle: '3(x - 4) = 15',
      problem: '3(x - 4) = 15',
      steps: '3(x - 4) = 15\n3x - 4 = 15\n3x = 19\nx = 19/3',
      tag: 'Distributive Property'
    },
    {
      title: 'Fraction Direct Addition Fallacy',
      subtitle: '1/2 + 1/3 = 2/5',
      problem: '1/2 + 1/3',
      steps: '1/2 + 1/3\n(1 + 1) / (2 + 3)\n= 2/5',
      tag: 'Fractions & Ratios'
    },
    {
      title: "Freshman's Dream Binomial Expansion",
      subtitle: '(x + 5)^2 = 36',
      problem: '(x + 5)^2 = 36',
      steps: '(x + 5)^2 = 36\nx^2 + 25 = 36\nx^2 = 11\nx = √11',
      tag: 'Algebraic Equivalence'
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setProblemText(preset.problem);
    setStudentSteps(preset.steps);
    setChallengeAnswer('');
    setChallengeFeedback(null);
  };

  const handleAnalyze = async () => {
    if (!problemText.trim() || !studentSteps.trim()) return;

    setIsLoading(true);
    setChallengeAnswer('');
    setChallengeFeedback(null);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await fetch('/api/analyze-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: problemText.trim(),
          studentSteps: studentSteps.trim()
        })
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data: ThinkingAnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.warn('API error, falling back to demo thinking analyzer:', err);
      const fallbackRes = await fetch(
        `/api/thinking/demo?problem=${encodeURIComponent(problemText)}&steps=${encodeURIComponent(studentSteps)}`
      );
      const data = await fallbackRes.json();
      setAnalysisResult(data);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!analysisResult) return;

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `
      Thinking Analysis. Detected reasoning issue: ${analysisResult.detected_issue}.
      Likely misconception: ${analysisResult.likely_misconception}.
      Better thinking strategy: ${analysisResult.better_thinking_strategy}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCheckChallenge = () => {
    if (!analysisResult?.remediation_challenge) return;
    const expected = analysisResult.remediation_challenge.expected_answer.toLowerCase().replace(/\s+/g, '');
    const user = challengeAnswer.toLowerCase().replace(/\s+/g, '');

    if (user === expected || user.includes(expected) || expected.includes(user)) {
      setChallengeFeedback('✅ Correct! You successfully applied the healthier mental model.');
    } else {
      setChallengeFeedback(`💡 Almost! Hint: ${analysisResult.remediation_challenge.hint}`);
    }
  };

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto">
      {/* Title & Philosophy Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Brain className="w-4 h-4 text-cyan-400" />
          Cognitive Diagnosis Engine
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Thinking Path <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Analyzer</span>
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto italic">
          “Don’t just solve the problem. Understand how the student thinks — and teach them to think better.”
        </p>
      </div>

      {/* Input Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              Submit Student Working & Reasoning
            </h3>
            <p className="text-xs text-slate-400">
              Enter the original problem and the student's step-by-step thinking to diagnose misconceptions.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Try 1-Click Common Misconceptions:
          </div>
        </div>

        {/* 1-Click Quick Preset Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              id={`preset-thinking-btn-${idx}`}
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  {preset.tag}
                </span>
                <span className="text-[10px] text-slate-500 group-hover:text-cyan-300 transition-colors">
                  Demo #{idx + 1}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                {preset.title}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                {preset.subtitle}
              </div>
            </button>
          ))}
        </div>

        {/* Two Inputs: Problem & Working */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Original Math Problem:</span>
            </label>
            <input
              type="text"
              id="thinking-problem-input"
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="e.g. 2x + 5 = 17"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>2. Student Reasoning / Attempted Steps (one per line):</span>
              <span className="text-[11px] text-slate-400 lowercase font-normal">Line-by-line inspection</span>
            </label>
            <textarea
              id="thinking-steps-input"
              rows={5}
              value={studentSteps}
              onChange={(e) => setStudentSteps(e.target.value)}
              placeholder="Enter student steps here, e.g.:&#10;2x + 5 = 17&#10;2x = 17 + 5&#10;2x = 22&#10;x = 11"
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-400">
            Specialized Cognitive Agent isolates misconceptions, faulty mental models & rewires thinking.
          </p>

          <button
            id="analyze-thinking-btn"
            onClick={handleAnalyze}
            disabled={isLoading || !problemText.trim() || !studentSteps.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Diagnosing Thinking Path...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Analyze How Student Thinks</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {analysisResult && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Diagnostic Top Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/40 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ⚠️ Detected Reasoning Issue
                    </span>
                    <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      {analysisResult.misconception_category}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {analysisResult.detected_issue}
                  </h3>
                </div>
              </div>

              {/* Speech Audio Button */}
              <button
                id="voice-explanation-btn"
                onClick={toggleSpeech}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSpeaking
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Listen to AI Coach speech explanation"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-400" />
                    <span>Stop Voice Coach</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>🔊 Listen to AI Explanation</span>
                  </>
                )}
              </button>
            </div>

            {/* Cognitive 5-Fold Diagnostic Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Likely Misconception */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                  Likely Misconception:
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {analysisResult.likely_misconception}
                </p>
                <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <strong className="text-slate-300">Root Cause:</strong> {analysisResult.why_mistake_happened}
                </div>
              </div>

              {/* Box 2: Better Thinking Strategy */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  Better Thinking Strategy:
                </div>
                <p className="text-sm text-emerald-200/90 leading-relaxed">
                  {analysisResult.better_thinking_strategy}
                </p>
                <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <strong className="text-emerald-400">Recommended Mindset:</strong> Focus on relational equivalence, not mechanical symbols.
                </div>
              </div>
            </div>

            {/* REWIRE YOUR THINKING: Mental Model Transformation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                Mental Model Transformation (Old vs Better)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Flawed Mental Model */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Flawed Mental Model (What the student thought):
                  </div>
                  <p className="text-xs text-rose-200 leading-relaxed font-mono">
                    "{analysisResult.cognitive_reframing.flawed_mental_model}"
                  </p>
                </div>

                {/* Healthy Mental Model */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Healthy Mental Model (How mathematicians think):
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed font-mono">
                    "{analysisResult.cognitive_reframing.healthy_mental_model}"
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step Cognitive Inspection Audit */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Step-by-Step Cognitive Inspection
              </h4>

              <div className="space-y-2">
                {analysisResult.step_by_step_audit.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                      step.valid
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        L{step.step_number}
                      </span>
                      <span className="font-mono text-sm font-semibold text-white">
                        {step.step_content}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {step.valid ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valid
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Breakdown Point
                        </span>
                      )}
                      <span className="text-slate-400">{step.feedback}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrected Expert Path */}
            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Corrected Expert Path (How to execute cleanly):
              </h4>

              <div className="space-y-1.5 font-mono text-xs">
                {analysisResult.corrected_expert_path.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-200">
                    <span className="text-cyan-400 font-bold">Step {idx + 1}:</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TARGETED REMEDIATION CHALLENGE */}
          {analysisResult.remediation_challenge && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/30 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Targeted Remediation Drill</h3>
                    <p className="text-xs text-slate-400">
                      Practice problem calibrated specifically to dismantle the{' '}
                      <strong className="text-cyan-400">{analysisResult.misconception_category}</strong>{' '}
                      misconception.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                  Instant Feedback
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Challenge:</p>
                <div className="text-lg font-mono font-bold text-white">
                  {analysisResult.remediation_challenge.question}
                </div>
                <p className="text-xs text-slate-400 italic">
                  💡 Hint: {analysisResult.remediation_challenge.hint}
                </p>
              </div>

              {/* Answer input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  id="remediation-answer-input"
                  value={challengeAnswer}
                  onChange={(e) => setChallengeAnswer(e.target.value)}
                  placeholder="e.g. x = 6"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  id="check-remediation-answer-btn"
                  onClick={handleCheckChallenge}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Verify My Answer
                </button>
              </div>

              {challengeFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold ${
                    challengeFeedback.startsWith('✅')
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {challengeFeedback}
                </div>
              )}
            </div>
          )}

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="text-slate-400">
              Want to solve with guided Socratic questioning or see full multi-agent optimizations?
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToSocratic && (
                <button
                  onClick={() => onNavigateToSocratic(problemText)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  Try Socratic Dialogue
                </button>
              )}
              {onNavigateToSolver && (
                <button
                  onClick={() => onNavigateToSolver(problemText)}
                  className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  View Multi-Agent Solutions
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
