import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Target,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Brain,
  FileText,
  Flame,
  Printer,
  Compass,
  Layers,
  ChevronRight,
  Lock,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { UserDashboardStats, PracticeQuestion, ConceptMapNode } from '../types/mathmentor.js';
import { LearningReportModal } from './LearningReportModal.js';

interface DashboardViewProps {
  onPracticeProblem: (problemText: string) => void;
  onOpenCoach?: () => void;
  onAnalyzeThinking?: (problemText: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onPracticeProblem,
  onOpenCoach,
  onAnalyzeThinking
}) => {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [selectedConcept, setSelectedConcept] = useState<ConceptMapNode | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.concept_map && data.concept_map.length > 0) {
          setSelectedConcept(data.concept_map[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = (q: PracticeQuestion) => {
    setCheckedQuestions((prev) => ({ ...prev, [q.id]: true }));
  };

  if (loading || !stats) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center animate-spin">
          <BarChart3 className="w-6 h-6" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Loading Intelligence Dashboard from SQLite...</p>
      </div>
    );
  }

  const allMissionChecked =
    stats.todays_mission.questions.every((q) => checkedQuestions[q.id]);

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Personalized Intelligence Dashboard
          </h2>
          <p className="text-slate-400 text-sm">
            Continuous cognitive tracking, adaptive mastery scores, and dynamic learning roadmap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="open-report-btn"
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Generate Learning Report
          </button>

          {onOpenCoach && (
            <button
              id="open-coach-btn"
              onClick={onOpenCoach}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              Ask MathMentor
            </button>
          )}

          <button
            id="refresh-stats-btn"
            onClick={fetchDashboardData}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* MY MATH PROFILE (5 KPIS) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase">Accuracy</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {stats.accuracy_percentage}%
          </div>
          <p className="text-[11px] text-slate-500">From {stats.total_problems_solved} solved problems</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase">Avg Solving Pace</div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {stats.avg_solving_time_sec}s
          </div>
          <p className="text-[11px] text-slate-500">Target exam pace: &lt; 60s</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase">Problems Solved</div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats.total_problems_solved}
          </div>
          <p className="text-[11px] text-slate-500">Logged in database</p>
        </div>

        {/* Metric 4: Adaptive Difficulty */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2">
          <div className="text-xs text-indigo-400 font-semibold uppercase flex items-center justify-between">
            <span>Challenge Level</span>
            <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300 font-bold">
              {stats.adaptive_difficulty?.tier || 'Intermediate'}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 font-mono">
            {stats.adaptive_difficulty?.challenge_level || '7.4 / 10'}
          </div>
          <p className="text-[11px] text-slate-400 truncate">Adaptive difficulty score</p>
        </div>

        {/* Metric 5: Active Learning Streak */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2 col-span-2 lg:col-span-1">
          <div className="text-xs text-amber-400 font-semibold uppercase flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Learning Streak
          </div>
          <div className="text-3xl font-extrabold text-amber-300 font-mono flex items-center gap-1.5">
            <span>{stats.streak_days || 5}</span>
            <span className="text-sm font-sans font-medium text-slate-400">Days</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">Consecutive practice</p>
        </div>
      </div>

      {/* 🗺️ MY PERSONALIZED LEARNING PATH (ROADMAP) */}
      {stats.learning_path && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                My Personalized Learning Path
              </h3>
              <p className="text-xs text-slate-400">
                Dynamic mathematical roadmap automatically structured from your individual performance:
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              🎯 Next Step: {stats.learning_path.recommended_next_step}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.learning_path.stages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                  stage.isCurrentTarget
                    ? 'bg-indigo-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10'
                    : stage.status === 'Mastered'
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                    : stage.status === 'Locked'
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/80 border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      stage.status === 'Mastered'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : stage.status === 'Developing'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : stage.status === 'Needs Practice'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{stage.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{stage.description}</p>
                </div>

                {stage.practiceProblem && (
                  <button
                    onClick={() => onPracticeProblem(stage.practiceProblem!)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Practice Drill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🧬 MY CONCEPT DEPENDENCY MAP */}
      {stats.concept_map && stats.concept_map.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                My Concept Dependency Map
              </h3>
              <p className="text-xs text-slate-400">
                Prerequisite relationships between mathematical domains. Click any concept node to inspect:
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Interactive Graph</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Concept Nodes List */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.concept_map.map((node) => {
                const isSelected = selectedConcept?.id === node.id;
                return (
                  <button
                    key={node.id}
                    id={`concept-node-${node.id}`}
                    onClick={() => setSelectedConcept(node)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyan-400">{node.category}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          node.status === 'Mastered'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : node.status === 'Developing'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {node.mastery_percentage}% {node.status}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white">{node.name}</div>

                    {node.prerequisites.length > 0 && (
                      <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                        <span className="text-slate-500">Prereq:</span> {node.prerequisites.join(', ')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Node Deep Inspector */}
            {selectedConcept && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">
                    {selectedConcept.category}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">{selectedConcept.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Mastery: {selectedConcept.mastery_percentage}%
                    </span>
                    <span className="text-xs text-slate-500">|</span>
                    <span className="text-xs text-slate-400">Avg Pace: {selectedConcept.avg_time_sec}s</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Prerequisites:</span>
                    <p className="text-slate-200 mt-0.5">
                      {selectedConcept.prerequisites.length > 0
                        ? selectedConcept.prerequisites.join(' → ')
                        : 'Foundational concept (None)'}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Recent Mistakes Tracked:</span>
                    <p className="text-amber-300 mt-0.5">
                      {selectedConcept.recent_mistakes.length > 0
                        ? selectedConcept.recent_mistakes.join('; ')
                        : 'None! Great execution.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                    <span className="font-bold text-cyan-400 uppercase text-[10px] block mb-1">
                      Recommended Practice:
                    </span>
                    <p className="text-slate-200">{selectedConcept.recommended_practice}</p>
                  </div>
                </div>

                <button
                  onClick={() => onPracticeProblem(`Practice drill for ${selectedConcept.name}`)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Start Concept Practice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎓 CONCEPT MASTERY (TRUE MASTERY SCORE) */}
      {stats.mastery_scores && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                True Concept Mastery Scores
              </h3>
              <p className="text-xs text-slate-400">
                Calculated using accuracy, consistency, speed, and hint independence across solving sessions:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.mastery_scores.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{m.concept}</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
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
                </div>

                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-extrabold font-mono text-cyan-400">{m.score}%</div>
                  <span className="text-[11px] text-slate-500">Mastery Index</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{m.explanation}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Pace: {m.speed}</span>
                  <span>Consistency: {m.consistency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🏆 LEARNING STREAKS AND ACHIEVEMENTS */}
      {stats.achievements && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Achievements & Mathematical Badges
              </h3>
              <p className="text-xs text-slate-400">Earn badges for speed, precision, and overcoming cognitive misconceptions:</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.achievements.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <div className="text-xs font-bold text-white">{badge.title}</div>
                <p className="text-[10px] text-slate-400 leading-tight">{badge.description}</p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase">
                  Unlocked
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT THINKING PATH DIAGNOSES */}
      {stats.recent_thinking_analyses && stats.recent_thinking_analyses.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                Recent Thinking Path Diagnoses
              </h3>
              <p className="text-xs text-slate-400">
                Cognitive inspections of how you solve equations, saved to SQLite:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {stats.recent_thinking_analyses.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-cyan-300 text-[10px] font-bold uppercase">
                      {item.misconception_category}
                    </span>
                    <span className="text-xs text-slate-400">{item.created_at || 'Recent'}</span>
                  </div>
                  <div className="text-base font-bold font-mono text-white">{item.problem}</div>
                  <p className="text-xs text-amber-300 font-medium">⚠️ {item.detected_issue}</p>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Better Mental Model:</strong> {item.better_thinking_strategy}
                  </p>
                </div>

                {onAnalyzeThinking && (
                  <button
                    onClick={() => onAnalyzeThinking(item.problem)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors"
                  >
                    View Diagnosis
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MISTAKE REPLAY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Mistake Replay Challenge</h3>
              <p className="text-xs text-slate-400">
                Re-solve past errors saved in SQLite to solidify weak concepts:
              </p>
            </div>
          </div>
        </div>

        {stats.mistake_replays.length > 0 ? (
          <div className="space-y-3">
            {stats.mistake_replays.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      {m.topic}
                    </span>
                    <span className="text-xs font-semibold text-rose-400">⚠️ {m.mistake_type}</span>
                    <span className="text-[11px] text-slate-500">{m.date}</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-white">{m.equation}</div>
                  <p className="text-xs text-slate-400">{m.problem}</p>
                </div>

                <button
                  id={`practice-again-btn-${m.id}`}
                  onClick={() => onPracticeProblem(m.equation)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  Practice Again
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No unresolved mistakes! Keep solving to generate logs.</p>
        )}
      </div>

      {/* TODAY'S PERSONALIZED MISSION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                  🎯 Today's Mission
                </span>
                <span className="text-xs text-slate-400 font-medium">Target Topic: {stats.todays_mission.target_topic}</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">{stats.todays_mission.title}</h3>
              <p className="text-xs text-slate-400">{stats.todays_mission.description}</p>
            </div>
          </div>

          {allMissionChecked && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
              🎉 Mission Complete!
            </span>
          )}
        </div>

        {/* Adaptive Questions */}
        <div className="space-y-4">
          {stats.todays_mission.questions.map((q, idx) => {
            const isChecked = checkedQuestions[q.id];
            const userAns = userAnswers[q.id] || '';

            return (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-cyan-300 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">{q.text}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Enter answer (e.g. x = 7)"
                    value={userAns}
                    onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-cyan-400 outline-none flex-1"
                  />

                  <button
                    id={`check-mission-q-${q.id}`}
                    onClick={() => handleCheckAnswer(q)}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Check Answer
                  </button>

                  <button
                    id={`send-to-solver-q-${q.id}`}
                    onClick={() => onPracticeProblem(q.text)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Solve with AI
                  </button>
                </div>

                {isChecked && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                    <div className="font-bold">✓ Expected Solution: {q.expected_answer}</div>
                    <div className="text-slate-400 text-[11px]">💡 Hint: {q.hint}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Report Modal */}
      <LearningReportModal
        stats={stats}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};
