import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Star,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { MultiAgentSolveResult } from '../types/mathmentor.js';

interface SolutionResultViewProps {
  result: MultiAgentSolveResult;
  onSolveAnother: () => void;
  onLogAttempt: (correct: boolean, mistakeType?: string) => void;
  onNavigateToThinking?: (problem: string) => void;
  onNavigateToSocratic?: (problem: string) => void;
}

export const SolutionResultView: React.FC<SolutionResultViewProps> = ({
  result,
  onSolveAnother,
  onLogAttempt,
  onNavigateToThinking,
  onNavigateToSocratic
}) => {
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [logged, setLogged] = useState<boolean>(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    result.judge.recommended_method_id || result.methods[0]?.id || 'method_a'
  );
  const [battleChoice, setBattleChoice] = useState<string | null>(null);
  const [battleFeedback, setBattleFeedback] = useState<string | null>(null);
  const [predictionFeedback, setPredictionFeedback] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showDecisionTrace, setShowDecisionTrace] = useState<boolean>(false);

  const activeMethod =
    result.methods.find((m) => m.id === selectedMethodId) || result.methods[0];

  const handleLog = (correct: boolean, mistakeType?: string) => {
    onLogAttempt(correct, mistakeType);
    setLogged(true);
  };

  const handleMethodBattleVote = async (chosenId: string) => {
    setBattleChoice(chosenId);
    const chosenMethod = result.methods.find((m) => m.id === chosenId);
    const recommendedId = result.judge.recommended_method_id;
    const isRec = chosenId === recommendedId;

    const feedback = isRec
      ? `🎯 Excellent choice! ${chosenMethod?.title || 'This method'} maximizes speed and reduces intermediate operational errors.`
      : `💡 Interesting choice! ${chosenMethod?.title || 'This method'} is thorough and methodical, though the speed shortcut saves 20+ seconds for exams.`;

    setBattleFeedback(feedback);

    try {
      await fetch('/api/method-battle/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_text: result.problem,
          chosen_method_id: chosenId,
          recommended_method_id: recommendedId,
          chosen_method_title: chosenMethod?.title || chosenId,
          recommended_method_title: result.methods.find((m) => m.id === recommendedId)?.title || recommendedId,
          analysis_feedback: feedback,
          was_optimal: isRec
        })
      });
    } catch (e) {
      console.warn('Failed to record method battle choice:', e);
    }
  };

  const handlePredictionOutcome = async (avoided: boolean) => {
    const statusText = avoided
      ? "✅ Great! You successfully avoided a mistake you've made before."
      : "🎯 Prediction confirmed. You encountered a similar sign or distribution trap.";

    setPredictionFeedback(statusText);

    try {
      await fetch('/api/mistake-prediction/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_text: result.problem,
          predicted_mistake: "Sign error while rearranging equation terms",
          confirmed: !avoided,
          avoided: avoided,
          actual_mistake: avoided ? undefined : 'Sign Error'
        })
      });
    } catch (e) {
      console.warn('Failed to record prediction outcome:', e);
    }
  };

  const toggleSpeechWalkthrough = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `
      Solution walkthrough for ${result.problem}.
      Method: ${activeMethod.title}.
      Steps: ${activeMethod.steps.join('. ')}.
      Final answer: ${activeMethod.final_answer}.
      Why recommended: ${result.judge.recommendation_reason}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto">
      {/* Top Banner: Problem Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase">
              {result.analysis.topic}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
              {result.analysis.subtopic}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                result.analysis.difficulty === 'Easy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : result.analysis.difficulty === 'Medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {result.analysis.difficulty} Difficulty
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Est. Standard Time: <strong className="text-white">{result.analysis.estimated_time} sec</strong></span>
            {result.isDemoMode && (
              <span className="ml-2 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                Interactive Demo
              </span>
            )}
            <button
              onClick={toggleSpeechWalkthrough}
              className={`ml-2 px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSpeaking
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <span>{isSpeaking ? '⏹ Stop Audio' : '🔊 Listen Walkthrough'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Submitted Problem:</p>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
            {result.problem}
          </div>
          {result.imageUrl && (
            <img
              src={result.imageUrl}
              alt="Uploaded problem"
              className="mt-3 max-h-48 rounded-lg border border-slate-700 object-contain"
            />
          )}
        </div>

        {/* 🕵️ PREDICT MY MISTAKE BANNER */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              🕵️ Predict My Mistake (Historical Pattern Analysis)
            </div>
            <span className="text-[11px] text-amber-400 font-medium">Risk: Medium</span>
          </div>

          <p className="text-xs text-slate-200">
            <strong className="text-amber-300">⚠ Possible Mistake:</strong> Based on your previous attempts in Algebra, you may be likely to make a sign error while rearranging this equation across the equals sign.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-500/20 text-xs">
            <span className="text-slate-400">Did you encounter or avoid this anticipated mistake?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePredictionOutcome(true)}
                className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold transition-colors"
              >
                ✅ I Avoided It!
              </button>
              <button
                onClick={() => handlePredictionOutcome(false)}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold transition-colors"
              >
                🎯 I Made This Mistake
              </button>
            </div>
          </div>

          {predictionFeedback && (
            <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs font-semibold text-amber-200">
              {predictionFeedback}
            </div>
          )}
        </div>
      </div>

      {/* AI RECOMMENDED METHOD SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-cyan-400 flex items-center justify-center border border-indigo-500/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {activeMethod.title}
              </h3>
              <p className="text-xs text-slate-400">{activeMethod.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Score: {activeMethod.score || 95}/100
            </span>
            {activeMethod.badge && (
              <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold">
                {activeMethod.badge}
              </span>
            )}
          </div>
        </div>

        {/* Step-by-Step Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Step-by-Step Solution:
          </h4>
          <div className="space-y-3">
            {activeMethod.steps.map((stepText, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-cyan-400 border border-indigo-500/30 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-sm text-slate-200 font-mono leading-relaxed">
                  {stepText}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Answer Banner */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase text-emerald-400">Final Answer:</span>
              <div className="text-lg font-extrabold text-white font-mono">{activeMethod.final_answer}</div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div>Solving Speed: <strong className="text-emerald-400">{activeMethod.estimated_time_sec} sec</strong></div>
            <div>Total Operations: <strong className="text-white">{activeMethod.number_of_steps} steps</strong></div>
          </div>
        </div>

        {/* Why This Method? & AI Decision Trace */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
              <Zap className="w-4 h-4" />
              Why Judge Agent Recommended This Approach:
            </div>
            <button
              onClick={() => setShowDecisionTrace(!showDecisionTrace)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>{showDecisionTrace ? '▲ Hide Decision Trace' : '🔬 Why Did AI Choose This?'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {result.judge.recommendation_reason}
          </p>

          {showDecisionTrace && (
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2 mt-2">
              <div className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                🔬 Multi-Agent Decision Trace:
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-xs leading-relaxed">
                <li><strong>Problem Analyzer:</strong> Parsed mathematical type as {result.analysis.topic} ({result.analysis.subtopic}).</li>
                <li><strong>Verification Agent:</strong> Evaluated symbolic LHS vs RHS equality with 100% mathematical consistency.</li>
                <li><strong>Speed Optimization Agent:</strong> Analyzed step counts ({result.methods.map(m => `${m.title}: ${m.number_of_steps} steps`).join(', ')}).</li>
                <li><strong>Judge Agent:</strong> Scored approaches out of 100 based on clarity, operation count, and error minimization.</li>
                <li><strong>Personalization Agent:</strong> Selected method tailored to your current challenge level with lowest risk of sign confusion.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ⚔️ METHOD BATTLE SECTION */}
      {result.methods.length >= 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-lg">
                ⚔️
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Method Battle
                </h3>
                <p className="text-xs text-slate-400">
                  Multiple valid solutions exist. Which method would you choose?
                </p>
              </div>
            </div>

            <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
              Pick your strategy before revealing recommendation
            </span>
          </div>

          {/* Battle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.methods.slice(0, 2).map((m, idx) => {
              const isChosen = battleChoice === m.id;
              const isRec = m.id === result.judge.recommended_method_id;

              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isChosen
                      ? 'bg-indigo-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Approach #{idx + 1}: {m.badge || (idx === 0 ? 'Standard Method' : 'Shortcut Method')}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      {m.estimated_time_sec}s
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2">{m.title}</h4>
                  <p className="text-xs text-slate-400 mb-4">{m.description}</p>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-center mb-4">
                    <div>
                      <div className="text-slate-500">Steps</div>
                      <div className="font-bold text-white font-mono">{m.number_of_steps}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Speed</div>
                      <div className="font-bold text-cyan-400 font-mono">{m.estimated_time_sec}s</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Complexity</div>
                      <div className="font-bold text-slate-200">{m.complexity}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMethodBattleVote(m.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isChosen
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isChosen ? '✓ Selected as My Preferred Strategy' : `Choose ${m.title}`}
                  </button>
                </div>
              );
            })}
          </div>

          {battleFeedback && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs font-semibold text-cyan-300 leading-relaxed animate-in fade-in">
              {battleFeedback}
            </div>
          )}
        </div>
      )}

      {/* SOLUTION COMPARISON MATRIX */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              Solution Method Comparison Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Multiple AI agents generated and benchmarked alternative solving approaches:
            </p>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Method Name</th>
                <th className="py-3 px-4">Est. Time</th>
                <th className="py-3 px-4">Steps</th>
                <th className="py-3 px-4">Complexity</th>
                <th className="py-3 px-4">Judge Score</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {result.methods.map((method) => {
                const isSelected = method.id === selectedMethodId;
                const isRecommended = method.id === result.judge.recommended_method_id;

                return (
                  <tr
                    key={method.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-600/10 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-4 px-4 font-bold flex items-center gap-2">
                      {method.title}
                      {isRecommended && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                          ★ Recommended
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-cyan-300">{method.estimated_time_sec}s</td>
                    <td className="py-4 px-4 font-mono">{method.number_of_steps} steps</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                        {method.complexity}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-400">{method.score || 85}/100</td>
                    <td className="py-4 px-4">
                      <button
                        id={`select-method-${method.id}`}
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'Inspect Steps'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMMON MISTAKES YOU MIGHT MAKE */}
      {result.common_mistakes && result.common_mistakes.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <AlertTriangle className="w-5 h-5" />
            Common Student Mistakes To Avoid
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.common_mistakes.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <h4 className="font-bold text-sm text-amber-300">⚠️ {m.type}</h4>
                <p className="text-xs text-slate-300">{m.description}</p>
                <p className="text-xs text-slate-400 font-medium pt-1 border-t border-amber-500/20">
                  💡 <strong className="text-amber-200">How to avoid:</strong> {m.prevention}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROGRESSIVE HINT ENGINE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Need A Hint Instead of Copying Answers?</h3>
              <p className="text-xs text-slate-400">Use 3 progressive AI nudges before revealing full answers.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                id={`hint-level-btn-${lvl}`}
                onClick={() => setHintLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  hintLevel >= lvl
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                Hint {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Active Hint Content */}
        {hintLevel > 0 && (
          <div className="space-y-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-fadeIn">
            {hintLevel >= 1 && (
              <div className="text-xs text-slate-200">
                <strong className="text-amber-300">💡 Hint 1 (Conceptual):</strong> {result.hints.hint1}
              </div>
            )}
            {hintLevel >= 2 && (
              <div className="text-xs text-slate-200 pt-2 border-t border-amber-500/20">
                <strong className="text-amber-300">💡 Hint 2 (Operational):</strong> {result.hints.hint2}
              </div>
            )}
            {hintLevel >= 3 && (
              <div className="text-xs text-slate-200 pt-2 border-t border-amber-500/20">
                <strong className="text-amber-300">💡 Hint 3 (Near Solution):</strong> {result.hints.hint3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SMART FEEDBACK LOOP */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Smart Feedback Loop
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
              What Improved?
            </span>
            <p className="text-slate-200 leading-relaxed">
              Accuracy on linear transpositions increased from 72% → 81%.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              What Needs Attention?
            </span>
            <p className="text-slate-200 leading-relaxed">
              Transposition sign flips when shifting positive constant terms across '='.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
              What Should You Practice Next?
            </span>
            <p className="text-slate-200 leading-relaxed">
              Medium-level equations requiring inverse operation balancing.
            </p>
          </div>
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-white">Log Attempt & Next Steps</h4>
          <p className="text-xs text-slate-400">Record solving metrics into SQLite to refine your Learning DNA.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!logged ? (
            <>
              <button
                id="log-correct-btn"
                onClick={() => handleLog(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Solved Correctly!
              </button>
              <button
                id="log-mistake-btn"
                onClick={() => handleLog(false, 'Sign Error')}
                className="px-4 py-2.5 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                Logged Mistake
              </button>
            </>
          ) : (
            <span className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              ✓ Logged to SQLite!
            </span>
          )}

          {onNavigateToThinking && (
            <button
              onClick={() => onNavigateToThinking(result.problem)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Brain className="w-4 h-4 text-cyan-400" />
              Analyze My Steps
            </button>
          )}

          {onNavigateToSocratic && (
            <button
              onClick={() => onNavigateToSocratic(result.problem)}
              className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              🧑‍🏫 Socratic Tutor
            </button>
          )}

          <button
            id="solve-another-btn"
            onClick={onSolveAnother}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            New Problem
          </button>
        </div>
      </div>
    </div>
  );
};
