import React from 'react';
import {
  X,
  Printer,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  ShieldCheck,
  Brain,
  Zap,
  BarChart3
} from 'lucide-react';
import { UserDashboardStats } from '../types/mathmentor.js';

interface LearningReportModalProps {
  stats: UserDashboardStats;
  isOpen: boolean;
  onClose: () => void;
}

export const LearningReportModal: React.FC<LearningReportModalProps> = ({
  stats,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:text-black">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">My AI Learning Report</h3>
              <p className="text-xs text-slate-400">Comprehensive Mathematical Cognitive Diagnostic</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1 text-slate-200 print:text-black print:p-4">
          {/* Header Banner */}
          <div className="border-b border-slate-800 pb-6 print:border-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black">
                MathMentor AI — Student Learning Diagnostic
              </h1>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Generated: {new Date().toLocaleDateString()} | Learning Streak: {stats.streak_days || 5} Days
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase print:border-black print:text-black">
                Challenge Level: {stats.adaptive_difficulty?.challenge_level || '7.4 / 10'}
              </span>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 print:border-gray-300">
              <div className="text-xs text-slate-400 font-semibold uppercase">Overall Accuracy</div>
              <div className="text-2xl font-extrabold text-emerald-400 print:text-black mt-1">
                {stats.accuracy_percentage}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 print:border-gray-300">
              <div className="text-xs text-slate-400 font-semibold uppercase">Avg Solving Pace</div>
              <div className="text-2xl font-extrabold text-cyan-400 print:text-black mt-1">
                {stats.avg_solving_time_sec}s
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 print:border-gray-300">
              <div className="text-xs text-slate-400 font-semibold uppercase">Problems Solved</div>
              <div className="text-2xl font-extrabold text-white print:text-black mt-1">
                {stats.total_problems_solved}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 print:border-gray-300">
              <div className="text-xs text-slate-400 font-semibold uppercase">Mastered Concepts</div>
              <div className="text-2xl font-extrabold text-indigo-400 print:text-black mt-1">
                {stats.mastery_scores?.filter((m) => m.status === 'Mastered').length || 2}
              </div>
            </div>
          </div>

          {/* Concept Mastery Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider print:text-black">
              1. Concept Mastery Breakdown
            </h3>
            <div className="border border-slate-800 rounded-2xl overflow-hidden print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 print:bg-gray-100 print:text-black border-b border-slate-800">
                  <tr>
                    <th className="p-3">Concept</th>
                    <th className="p-3">Mastery Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Evaluation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
                  {(stats.mastery_scores || []).map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40">
                      <td className="p-3 font-semibold text-white print:text-black">{m.concept}</td>
                      <td className="p-3 font-mono font-bold text-cyan-400 print:text-black">{m.score}%</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            m.status === 'Mastered'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : m.status === 'Proficient'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : m.status === 'Developing'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 print:text-gray-700">{m.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cognitive Misconception Radar */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider print:text-black">
              2. Cognitive Misconceptions Tracked
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(stats.misconceptions_radar || []).map((misc, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 print:border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 print:text-black uppercase">
                      {misc.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Occurrences: {misc.count}</span>
                  </div>
                  <p className="text-xs text-slate-300 print:text-gray-800">{misc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Coach Personalized Advice */}
          <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3 print:border-gray-400 print:bg-transparent">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider print:text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              3. AI Mathematics Coach Personalized Advice
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 print:text-gray-800 leading-relaxed">
              {stats.smart_feedback?.what_improved}
              {" "}
              {stats.smart_feedback?.what_needs_attention}
            </p>
            <div className="text-xs text-indigo-300 print:text-black font-semibold pt-2 border-t border-indigo-500/20">
              🎯 Recommended Next Learning Goal: {stats.learning_path?.recommended_next_step || 'Practice factorisation fundamentals.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
