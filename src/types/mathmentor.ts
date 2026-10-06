export type AgentType =
  | 'analyzer'
  | 'solver'
  | 'alt_solver'
  | 'speed'
  | 'verifier'
  | 'judge'
  | 'hint'
  | 'personalization';

export interface AgentStep {
  id: string;
  agentType: AgentType;
  agentName: string;
  iconName: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: any;
  durationMs?: number;
}

export interface ProblemAnalysis {
  topic: string;
  subtopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  concepts: string[];
  estimated_time: number;
}

export interface SolutionMethod {
  id: string;
  method_name: string;
  title: string;
  description: string;
  steps: string[];
  final_answer: string;
  estimated_time_sec: number;
  number_of_steps: number;
  complexity: 'Low' | 'Medium' | 'High';
  why_faster?: string;
  score?: number;
  badge?: string;
}

export interface VerificationResult {
  correct: boolean;
  confidence: number;
  sympy_or_mathjs_checked: boolean;
  symbolic_check_summary: string;
  errors: string[];
}

export interface JudgeResult {
  scores: { method_id: string; method_name: string; score: number; rationale: string }[];
  recommended_method_id: string;
  recommendation_reason: string;
}

export interface HintSet {
  hint1: string;
  hint2: string;
  hint3: string;
}

export interface CommonMistake {
  type: string;
  description: string;
  prevention: string;
}

export interface PersonalizationFeedback {
  weak_topics: string[];
  common_mistakes: string[];
  accuracy: number;
  average_time: number;
  feedback_summary: string;
  next_learning_goal: string;
}

export interface MultiAgentSolveResult {
  problem: string;
  imageUrl?: string;
  analysis: ProblemAnalysis;
  methods: SolutionMethod[];
  verification: VerificationResult;
  judge: JudgeResult;
  hints: HintSet;
  common_mistakes: CommonMistake[];
  personalization: PersonalizationFeedback;
  isDemoMode?: boolean;
}

export interface UserAttempt {
  id?: number;
  problem_text: string;
  topic: string;
  difficulty: string;
  correct: boolean;
  solving_time_sec: number;
  mistake_type?: string;
  timestamp?: string;
}

export interface DNAAttribute {
  name: string;
  score: number;
}

export interface MistakeReplayItem {
  id: number | string;
  topic: string;
  mistake_type: string;
  date: string;
  problem: string;
  equation: string;
}

export interface PracticeQuestion {
  id: string;
  text: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expected_answer: string;
  hint: string;
}

export interface DailyMission {
  title: string;
  target_topic: string;
  description: string;
  questions: PracticeQuestion[];
}

export interface StepAuditItem {
  step_number: number;
  step_content: string;
  valid: boolean;
  feedback: string;
}

export interface ThinkingAnalysisResult {
  id?: number | string;
  problem: string;
  student_steps: string;
  detected_step_index?: number;
  detected_mistake_step?: string;
  is_fully_correct: boolean;
  overall_status: 'reasoning_flaw' | 'conceptual_misconception' | 'calculation_error' | 'flawless';
  detected_issue: string;
  likely_misconception: string;
  misconception_category: 'Inverse Operations' | 'Distributive Property' | 'Fractions & Ratios' | 'Exponents & Powers' | 'Order of Operations' | 'Algebraic Equivalence' | 'Sign Convention' | 'Other';
  why_mistake_happened: string;
  better_thinking_strategy: string;
  cognitive_reframing: {
    flawed_mental_model: string;
    healthy_mental_model: string;
  };
  step_by_step_audit: StepAuditItem[];
  corrected_expert_path: string[];
  remediation_challenge: {
    question: string;
    hint: string;
    expected_answer: string;
  };
  isDemoMode?: boolean;
  created_at?: string;
}

export interface SocraticMessage {
  id: string;
  sender: 'student' | 'agent';
  content: string;
  timestamp: string;
  guiding_question?: string;
  praise?: string;
  detected_insight?: string;
  isSolved?: boolean;
}

export interface StepVerificationResult {
  step: string;
  isValid: boolean;
  sympy_or_mathjs_checked: boolean;
  feedback: string;
  nudge: string;
  isFinalAnswer: boolean;
  canonical_form?: string;
}

export interface MisconceptionSummary {
  category: string;
  count: number;
  description: string;
  lastEncountered: string;
}

export interface MethodBattleChoice {
  problem_text: string;
  chosen_method_id: string;
  recommended_method_id: string;
  chosen_method_title: string;
  recommended_method_title: string;
  analysis_feedback: string;
  wasOptimal: boolean;
  timestamp?: string;
}

export interface MistakePrediction {
  problem_text: string;
  predicted_mistake: string;
  reason: string;
  risk_level: 'Low' | 'Medium' | 'High';
  was_tested?: boolean;
  confirmed?: boolean;
  avoided?: boolean;
  actual_mistake?: string;
}

export interface AdaptiveDifficulty {
  score: number; // 0 - 100
  challenge_level: string; // e.g. "7.4 / 10"
  tier: 'Foundation' | 'Intermediate' | 'Advanced' | 'Olympiad';
  adaptation_rationale: string;
  accuracy_factor: number;
  speed_factor: number;
  consistency_factor: number;
}

export interface ConceptMapNode {
  id: string;
  name: string;
  category: string;
  mastery_percentage: number;
  status: 'Mastered' | 'Proficient' | 'Developing' | 'Needs Practice' | 'Locked';
  accuracy: number;
  avg_time_sec: number;
  recent_mistakes: string[];
  prerequisites: string[];
  recommended_practice: string;
}

export interface ConceptMasteryScore {
  concept: string;
  score: number;
  status: 'Beginner' | 'Developing' | 'Proficient' | 'Advanced' | 'Mastered';
  explanation: string;
  accuracy: number;
  speed: string;
  consistency: string;
}

export interface LearningPathStage {
  id: string;
  title: string;
  status: 'Mastered' | 'Developing' | 'Needs Practice' | 'Locked';
  progress: number;
  description: string;
  isCurrentTarget?: boolean;
  practiceProblem?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface HandwrittenStep {
  step_number: number;
  expression: string;
  status: 'correct' | 'needs_attention' | 'incorrect' | 'inefficient';
  error_type?: string;
  feedback: string;
}

export interface HandwrittenAnalysisResult {
  problem: string;
  imageUrl?: string;
  confidence_score: number;
  is_clear: boolean;
  detected_steps: HandwrittenStep[];
  ai_feedback: string;
  where_reasoning_deviated: string;
  final_answer_valid: boolean;
  better_thinking_suggestion: string;
}

export interface SmartFeedbackLoop {
  what_improved: string;
  what_needs_attention: string;
  what_to_practice_next: string;
  accuracy_delta: string;
  mistakes_avoided: string;
}

export interface AICoachMessage {
  id: string;
  sender: 'student' | 'coach';
  message: string;
  timestamp: string;
  context_tags?: string[];
  recommended_action?: {
    label: string;
    action_type: 'practice' | 'concept_map' | 'learning_path' | 'solve';
    payload: string;
  };
}

export interface UserDashboardStats {
  accuracy_percentage: number;
  avg_solving_time_sec: number;
  total_problems_solved: number;
  strongest_topic: string;
  needs_improvement_topic: string;
  learning_dna: DNAAttribute[];
  accuracy_history: { date: string; accuracy: number }[];
  speed_history: { date: string; speed_sec: number }[];
  mistake_replays: MistakeReplayItem[];
  todays_mission: DailyMission;
  recent_thinking_analyses?: ThinkingAnalysisResult[];
  misconceptions_radar?: MisconceptionSummary[];
  adaptive_difficulty?: AdaptiveDifficulty;
  concept_map?: ConceptMapNode[];
  mastery_scores?: ConceptMasteryScore[];
  learning_path?: {
    stages: LearningPathStage[];
    recommended_next_step: string;
  };
  achievements?: AchievementBadge[];
  streak_days?: number;
  predicted_mistake_for_next?: MistakePrediction;
  smart_feedback?: SmartFeedbackLoop;
}
