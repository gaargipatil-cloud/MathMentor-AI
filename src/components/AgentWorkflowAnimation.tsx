import React, { useEffect, useState } from 'react';
import {
  Brain,
  Calculator,
  Zap,
  CheckCircle2,
  Scale,
  Target,
  Lightbulb,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { AgentStep } from '../types/mathmentor.js';

interface AgentWorkflowAnimationProps {
  onComplete: () => void;
}

export const AgentWorkflowAnimation: React.FC<AgentWorkflowAnimationProps> = ({
  onComplete
}) => {
  const [steps, setSteps] = useState<AgentStep[]>([
    {
      id: '1',
      agentType: 'analyzer',
      agentName: 'Problem Analyzer',
      iconName: 'Brain',
      title: '🧠 Problem Analyzer Agent',
      description: 'Identifying mathematical domain, subtopic, concepts, and difficulty...',
      status: 'running'
    },
    {
      id: '2',
      agentType: 'solver',
      agentName: 'Standard Solver Agent',
      iconName: 'Calculator',
      title: '📐 Standard Solver Agent',
      description: 'Generating step-by-step algebraic isolation method...',
      status: 'pending'
    },
    {
      id: '3',
      agentType: 'speed',
      agentName: 'Speed Optimization Agent',
      iconName: 'Zap',
      title: '⚡ Speed Optimization Agent',
      description: 'Analyzing operations and searching for speed shortcuts...',
      status: 'pending'
    },
    {
      id: '4',
      agentType: 'verifier',
      agentName: 'Verification Agent',
      iconName: 'ShieldCheck',
      title: '🔍 Verification Agent (MathJS Symbolic)',
      description: 'Evaluating expression LHS vs RHS and verifying correctness...',
      status: 'pending'
    },
    {
      id: '5',
      agentType: 'judge',
      agentName: 'Judge Agent',
      iconName: 'Scale',
      title: '⚖️ Judge Agent',
      description: 'Comparing all generated approaches and calculating efficiency score...',
      status: 'pending'
    },
    {
      id: '6',
      agentType: 'personalization',
      agentName: 'Personalization Agent',
      iconName: 'Target',
      title: '🎯 Personalization Agent',
      description: 'Cross-referencing SQLite student history and detecting sign error trends...',
      status: 'pending'
    },
    {
      id: '7',
      agentType: 'hint',
      agentName: 'Hint Agent',
      iconName: 'Lightbulb',
      title: '💡 Hint Agent',
      description: 'Structuring 3 progressive hints for guided student learning...',
      status: 'pending'
    }
  ]);

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < steps.length - 1) {
          const nextIndex = prev + 1;
          setSteps((prevSteps) =>
            prevSteps.map((step, idx) => {
              if (idx < nextIndex) return { ...step, status: 'completed' };
              if (idx === nextIndex) return { ...step, status: 'running' };
              return { ...step, status: 'pending' };
            })
          );
          return nextIndex;
        } else {
          setSteps((prevSteps) => prevSteps.map((s) => ({ ...s, status: 'completed' })));
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 450); // Fast 450ms intervals per agent step for responsive UX

    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.round(((activeStepIndex + 1) / steps.length) * 100);

  return (
    <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          Multi-Agent Collaborative Pipeline Active
        </div>
        <h2 className="text-2xl font-bold text-white">Analyzing Problem & Generating Solutions</h2>
        <p className="text-slate-400 text-sm">
          Watch specialized AI agents solve, verify, and personalize your math coach experience in real-time.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isRunning = step.status === 'running';
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                isRunning
                  ? 'bg-indigo-600/10 border-cyan-400/80 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                  : isCompleted
                  ? 'bg-slate-800/40 border-slate-700/60 opacity-90'
                  : 'bg-slate-900/40 border-slate-800 opacity-40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isRunning
                      ? 'bg-cyan-500 text-slate-950 animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : idx + 1}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                </div>
              </div>

              <div className="text-xs font-semibold">
                {isRunning && (
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing...
                  </span>
                )}
                {isCompleted && (
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    ✓ Ready
                  </span>
                )}
                {step.status === 'pending' && <span className="text-slate-600">Waiting...</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
