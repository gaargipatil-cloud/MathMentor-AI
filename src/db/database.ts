import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import {
  UserAttempt,
  UserDashboardStats,
  MistakeReplayItem,
  DailyMission,
  ThinkingAnalysisResult,
  MisconceptionSummary
} from '../types/mathmentor.js';

let db: Database | null = null;
const dbFilePath = path.join(process.cwd(), 'mathmentor.sqlite');

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    db = new SQL.Database(fileBuffer);
    initSchema(db);
    saveDb();
  } else {
    db = new SQL.Database();
    initSchema(db);
    saveDb();
  }

  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbFilePath, buffer);
}

function initSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_text TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      correct BOOLEAN NOT NULL,
      solving_time_sec INTEGER NOT NULL,
      mistake_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      mistake_type TEXT NOT NULL,
      equation TEXT NOT NULL,
      problem TEXT NOT NULL,
      resolved BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS thinking_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem TEXT NOT NULL,
      student_steps TEXT NOT NULL,
      is_fully_correct BOOLEAN NOT NULL,
      overall_status TEXT NOT NULL,
      detected_issue TEXT NOT NULL,
      likely_misconception TEXT NOT NULL,
      misconception_category TEXT NOT NULL,
      why_mistake_happened TEXT NOT NULL,
      better_thinking_strategy TEXT NOT NULL,
      flawed_mental_model TEXT,
      healthy_mental_model TEXT,
      step_audit_json TEXT,
      corrected_expert_path_json TEXT,
      remediation_question TEXT,
      remediation_hint TEXT,
      remediation_answer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS method_battles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_text TEXT NOT NULL,
      chosen_method_id TEXT NOT NULL,
      recommended_method_id TEXT NOT NULL,
      chosen_method_title TEXT NOT NULL,
      recommended_method_title TEXT NOT NULL,
      analysis_feedback TEXT NOT NULL,
      was_optimal BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mistake_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_text TEXT NOT NULL,
      predicted_mistake TEXT NOT NULL,
      reason TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      was_tested BOOLEAN DEFAULT 0,
      confirmed BOOLEAN DEFAULT 0,
      avoided BOOLEAN DEFAULT 0,
      actual_mistake TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS socratic_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_text TEXT NOT NULL,
      total_turns INTEGER NOT NULL,
      hints_used INTEGER NOT NULL,
      solved BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coach_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      context_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if we need seed data
  const res = database.exec('SELECT COUNT(*) as count FROM attempts');
  const count = res[0]?.values[0]?.[0] as number || 0;

  if (count === 0) {
    seedDatabase(database);
  } else {
    // Check if thinking_analyses is empty even if attempts exist
    const tRes = database.exec('SELECT COUNT(*) as count FROM thinking_analyses');
    const tCount = tRes[0]?.values[0]?.[0] as number || 0;
    if (tCount === 0) {
      seedThinkingAnalyses(database);
    }
  }
}

function seedThinkingAnalyses(database: Database) {
  const sampleAnalyses = [
    {
      problem: '2x + 5 = 17',
      student_steps: '2x + 5 = 17\n2x = 17 + 5\n2x = 22\nx = 11',
      is_fully_correct: 0,
      overall_status: 'conceptual_misconception',
      detected_issue: 'Sign flip error: Changed +5 to +5 on the right side instead of subtracting 5.',
      likely_misconception: 'The student may not fully understand inverse operations and views transposition as mechanical moving rather than balancing.',
      misconception_category: 'Inverse Operations',
      why_mistake_happened: 'Rote memorization of "move across equals" without applying the additive inverse property to both sides.',
      better_thinking_strategy: 'Instead of memorizing "move to the other side", balance both sides by subtracting 5 from both sides (2x + 5 - 5 = 17 - 5).',
      flawed_mental_model: 'Terms can jump across "=" without changing sign or by keeping their original sign.',
      healthy_mental_model: 'The equal sign is a balanced scale; whatever operation is done to one side must be done identically to the other.',
      step_audit_json: JSON.stringify([
        { step_number: 1, step_content: '2x + 5 = 17', valid: true, feedback: 'Correct starting equation.' },
        { step_number: 2, step_content: '2x = 17 + 5', valid: false, feedback: 'Error: Adding 5 instead of subtracting 5.' },
        { step_number: 3, step_content: '2x = 22', valid: false, feedback: 'Arithmetic propagates the sign error.' },
        { step_number: 4, step_content: 'x = 11', valid: false, feedback: 'Incorrect final root due to earlier step.' }
      ]),
      corrected_expert_path_json: JSON.stringify([
        '2x + 5 = 17',
        '2x + 5 - 5 = 17 - 5  (Subtract 5 from both sides)',
        '2x = 12',
        'x = 12 / 2 = 6'
      ]),
      remediation_question: 'Solve for x: 3x + 7 = 22',
      remediation_hint: 'Subtract 7 from both sides first (3x = 22 - 7 = 15), then divide by 3.',
      remediation_answer: 'x = 5'
    },
    {
      problem: '3(x - 4) = 15',
      student_steps: '3(x - 4) = 15\n3x - 4 = 15\n3x = 19\nx = 19/3',
      is_fully_correct: 0,
      overall_status: 'reasoning_flaw',
      detected_issue: 'Partial distribution: Multiplied 3 by x, but failed to multiply 3 by -4.',
      likely_misconception: 'Incomplete application of the distributive property over subtraction.',
      misconception_category: 'Distributive Property',
      why_mistake_happened: 'Treated the factor 3 as only binding to the first variable x rather than the entire grouped quantity.',
      better_thinking_strategy: 'Distribute the outer multiplier to EVERY term inside parentheses: 3 * x and 3 * (-4) = -12.',
      flawed_mental_model: 'A coefficient before parentheses only attaches to the adjacent variable.',
      healthy_mental_model: 'Parentheses form a packaged container; any coefficient multiplies all contents inside.',
      step_audit_json: JSON.stringify([
        { step_number: 1, step_content: '3(x - 4) = 15', valid: true, feedback: 'Problem stated.' },
        { step_number: 2, step_content: '3x - 4 = 15', valid: false, feedback: 'Distribution error: 3 * (-4) must be -12, not -4.' },
        { step_number: 3, step_content: '3x = 19', valid: false, feedback: 'Propagated error.' },
        { step_number: 4, step_content: 'x = 19/3', valid: false, feedback: 'Incorrect answer.' }
      ]),
      corrected_expert_path_json: JSON.stringify([
        '3(x - 4) = 15',
        '3x - 12 = 15  (Distribute 3 to both x and -4)',
        '3x = 15 + 12 = 27',
        'x = 27 / 3 = 9'
      ]),
      remediation_question: 'Solve for y: 2(y + 6) = 20',
      remediation_hint: 'Multiply 2 by both y and 6 (2y + 12 = 20), or divide both sides by 2 first.',
      remediation_answer: 'y = 4'
    }
  ];

  for (const item of sampleAnalyses) {
    database.run(
      `INSERT INTO thinking_analyses (
        problem, student_steps, is_fully_correct, overall_status, detected_issue,
        likely_misconception, misconception_category, why_mistake_happened,
        better_thinking_strategy, flawed_mental_model, healthy_mental_model,
        step_audit_json, corrected_expert_path_json, remediation_question,
        remediation_hint, remediation_answer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.problem,
        item.student_steps,
        item.is_fully_correct,
        item.overall_status,
        item.detected_issue,
        item.likely_misconception,
        item.misconception_category,
        item.why_mistake_happened,
        item.better_thinking_strategy,
        item.flawed_mental_model,
        item.healthy_mental_model,
        item.step_audit_json,
        item.corrected_expert_path_json,
        item.remediation_question,
        item.remediation_hint,
        item.remediation_answer
      ]
    );
  }
}

function seedDatabase(database: Database) {
  database.run("INSERT INTO users (name) VALUES ('MathMentor Student')");

  // Initial historic attempt seeds
  const sampleAttempts = [
    ['2x + 5 = 17', 'Algebra', 'Easy', 1, 35, null, '2026-08-05 10:00:00'],
    ['x^2 - 5x + 6 = 0', 'Algebra', 'Medium', 1, 52, null, '2026-08-06 11:30:00'],
    ['3x - 7 = 14', 'Algebra', 'Easy', 0, 65, 'Sign Error', '2026-08-07 14:15:00'],
    ['Area of circle radius 7', 'Geometry', 'Easy', 1, 40, null, '2026-08-08 09:20:00'],
    ['sin^2(x) + cos^2(x) = 1', 'Trigonometry', 'Medium', 1, 45, null, '2026-08-09 16:40:00'],
    ['2(x + 4) = 20', 'Algebra', 'Easy', 0, 58, 'Distribution Error', '2026-08-10 12:10:00'],
    ['x^2 + 4x + 4 = 0', 'Algebra', 'Easy', 1, 32, null, '2026-08-10 18:00:00'],
    ['Pythagorean theorem 3,4,c', 'Geometry', 'Easy', 1, 38, null, '2026-08-11 10:00:00']
  ];

  for (const att of sampleAttempts) {
    database.run(
      `INSERT INTO attempts (problem_text, topic, difficulty, correct, solving_time_sec, mistake_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      att
    );
  }

  // Mistakes seed
  database.run(`
    INSERT INTO mistakes (topic, mistake_type, equation, problem, resolved, created_at) VALUES
    ('Algebra', 'Sign Error', '3x - 7 = 14', 'Forgot to flip sign when adding -7 to right side', 0, '2026-08-07 14:15:00'),
    ('Algebra', 'Distribution Error', '2(x + 4) = 20', 'Forgot to multiply 2 by 4 inside parentheses', 0, '2026-08-10 12:10:00')
  `);
}

export async function recordUserAttempt(attempt: UserAttempt) {
  const database = await getDb();
  database.run(
    `INSERT INTO attempts (problem_text, topic, difficulty, correct, solving_time_sec, mistake_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      attempt.problem_text,
      attempt.topic,
      attempt.difficulty,
      attempt.correct ? 1 : 0,
      attempt.solving_time_sec,
      attempt.mistake_type || null
    ]
  );

  if (!attempt.correct && attempt.mistake_type) {
    database.run(
      `INSERT INTO mistakes (topic, mistake_type, equation, problem, resolved)
       VALUES (?, ?, ?, ?, 0)`,
      [
        attempt.topic,
        attempt.mistake_type,
        attempt.problem_text,
        `Incorrect step during solving ${attempt.problem_text}`
      ]
    );
  }

  saveDb();
}

export async function getUserDashboardStats(): Promise<UserDashboardStats> {
  const database = await getDb();

  // Summary stats
  const totalRes = database.exec('SELECT COUNT(*) FROM attempts');
  const totalSolved = (totalRes[0]?.values[0]?.[0] as number) || 0;

  const correctRes = database.exec('SELECT COUNT(*) FROM attempts WHERE correct = 1');
  const correctCount = (correctRes[0]?.values[0]?.[0] as number) || 0;

  const avgTimeRes = database.exec('SELECT AVG(solving_time_sec) FROM attempts');
  const avgTime = Math.round((avgTimeRes[0]?.values[0]?.[0] as number) || 45);

  const accuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 100;

  // Topic breakdown
  const topicStatsRes = database.exec(`
    SELECT topic, COUNT(*) as total, SUM(correct) as correct_cnt, AVG(solving_time_sec) as avg_t
    FROM attempts
    GROUP BY topic
  `);

  let strongestTopic = 'Arithmetic';
  let needsImprovementTopic = 'Algebra';
  let bestAccuracy = -1;
  let worstAccuracy = 999;

  if (topicStatsRes[0]?.values) {
    for (const row of topicStatsRes[0].values) {
      const topic = row[0] as string;
      const tot = row[1] as number;
      const corr = (row[2] as number) || 0;
      const acc = tot > 0 ? (corr / tot) * 100 : 0;

      if (acc > bestAccuracy) {
        bestAccuracy = acc;
        strongestTopic = topic;
      }
      if (acc < worstAccuracy) {
        worstAccuracy = acc;
        needsImprovementTopic = topic;
      }
    }
  }

  // Learning DNA Scores
  const learningDna = [
    { name: 'Accuracy', score: accuracy },
    { name: 'Solving Speed', score: Math.min(100, Math.max(40, 100 - (avgTime - 30))) },
    { name: 'Algebra', score: needsImprovementTopic === 'Algebra' ? 62 : 88 },
    { name: 'Geometry', score: 85 },
    { name: 'Arithmetic', score: 94 },
    { name: 'Logical Reasoning', score: 78 }
  ];

  // Accuracy history over time
  const historyRes = database.exec(`
    SELECT strftime('%m/%d', created_at) as day, COUNT(*) as tot, SUM(correct) as corr, AVG(solving_time_sec) as avg_s
    FROM attempts
    GROUP BY day
    ORDER BY created_at ASC
    LIMIT 7
  `);

  const accuracy_history: { date: string; accuracy: number }[] = [];
  const speed_history: { date: string; speed_sec: number }[] = [];

  if (historyRes[0]?.values) {
    for (const row of historyRes[0].values) {
      const day = (row[0] as string) || 'Today';
      const tot = row[1] as number;
      const corr = (row[2] as number) || 0;
      const avgS = Math.round((row[3] as number) || 45);
      const acc = Math.round((corr / tot) * 100);

      accuracy_history.push({ date: day, accuracy: acc });
      speed_history.push({ date: day, speed_sec: avgS });
    }
  } else {
    accuracy_history.push({ date: '08/05', accuracy: 80 }, { date: '08/07', accuracy: 85 }, { date: '08/11', accuracy: 92 });
    speed_history.push({ date: '08/05', speed_sec: 65 }, { date: '08/07', speed_sec: 52 }, { date: '08/11', speed_sec: 42 });
  }

  // Mistake Replays
  const mistakesRes = database.exec(`
    SELECT id, topic, mistake_type, strftime('%Y-%m-%d', created_at) as dt, equation, problem
    FROM mistakes
    WHERE resolved = 0
    ORDER BY created_at DESC
    LIMIT 5
  `);

  const mistake_replays: MistakeReplayItem[] = [];
  if (mistakesRes[0]?.values) {
    for (const row of mistakesRes[0].values) {
      mistake_replays.push({
        id: row[0] as number,
        topic: row[1] as string,
        mistake_type: row[2] as string,
        date: row[3] as string,
        problem: row[5] as string,
        equation: row[4] as string
      });
    }
  }

  // Recent Thinking Path Analyses
  const thinkingRes = database.exec(`
    SELECT id, problem, student_steps, is_fully_correct, overall_status, detected_issue,
           likely_misconception, misconception_category, why_mistake_happened,
           better_thinking_strategy, flawed_mental_model, healthy_mental_model,
           step_audit_json, corrected_expert_path_json, remediation_question,
           remediation_hint, remediation_answer, strftime('%Y-%m-%d %H:%M', created_at) as dt
    FROM thinking_analyses
    ORDER BY created_at DESC
    LIMIT 6
  `);

  const recent_thinking_analyses: ThinkingAnalysisResult[] = [];
  if (thinkingRes[0]?.values) {
    for (const r of thinkingRes[0].values) {
      try {
        recent_thinking_analyses.push({
          id: r[0] as number,
          problem: r[1] as string,
          student_steps: r[2] as string,
          is_fully_correct: Boolean(r[3]),
          overall_status: r[4] as any,
          detected_issue: r[5] as string,
          likely_misconception: r[6] as string,
          misconception_category: r[7] as any,
          why_mistake_happened: r[8] as string,
          better_thinking_strategy: r[9] as string,
          cognitive_reframing: {
            flawed_mental_model: (r[10] as string) || '',
            healthy_mental_model: (r[11] as string) || ''
          },
          step_by_step_audit: r[12] ? JSON.parse(r[12] as string) : [],
          corrected_expert_path: r[13] ? JSON.parse(r[13] as string) : [],
          remediation_challenge: {
            question: (r[14] as string) || '',
            hint: (r[15] as string) || '',
            expected_answer: (r[16] as string) || ''
          },
          created_at: r[17] as string
        });
      } catch (err) {
        console.warn('Error parsing thinking analysis row:', err);
      }
    }
  }

  // Misconceptions Radar
  const miscRes = database.exec(`
    SELECT misconception_category, COUNT(*) as cnt, likely_misconception, strftime('%Y-%m-%d', MAX(created_at)) as last_seen
    FROM thinking_analyses
    WHERE is_fully_correct = 0
    GROUP BY misconception_category
    ORDER BY cnt DESC
  `);
  const misconceptions_radar: MisconceptionSummary[] = [];
  if (miscRes[0]?.values) {
    for (const row of miscRes[0].values) {
      misconceptions_radar.push({
        category: (row[0] as string) || 'General',
        count: (row[1] as number) || 1,
        description: (row[2] as string) || '',
        lastEncountered: (row[3] as string) || 'Recent'
      });
    }
  }

  // Today's Mission
  const todays_mission: DailyMission = {
    title: "Master Linear Equations & Distribution Rules",
    target_topic: needsImprovementTopic,
    description: "Personalized sequence targeting sign flip errors and distribution rules based on your performance logs.",
    questions: [
      {
        id: "q1",
        text: "Solve for x: 3x - 5 = 16",
        topic: "Algebra",
        difficulty: "Easy",
        expected_answer: "x = 7",
        hint: "Add 5 to both sides first, then divide by 3."
      },
      {
        id: "q2",
        text: "Solve for y: 4(y - 3) = 28",
        topic: "Algebra",
        difficulty: "Medium",
        expected_answer: "y = 10",
        hint: "Distribute the 4 into parentheses: 4y - 12 = 28, or divide both sides by 4."
      },
      {
        id: "q3",
        text: "Solve for x: 5x + 12 = 2x - 3",
        topic: "Algebra",
        difficulty: "Medium",
        expected_answer: "x = -5",
        hint: "Subtract 2x from both sides to get 3x + 12 = -3, then subtract 12."
      },
      {
        id: "q4",
        text: "Solve for x: x^2 - 7x + 12 = 0",
        topic: "Algebra",
        difficulty: "Hard",
        expected_answer: "x = 3 or x = 4",
        hint: "Find two numbers that multiply to +12 and add up to -7 (-3 and -4)."
      }
    ]
  };

  // Adaptive Difficulty Score (0 - 100 & challenge level e.g. 7.4 / 10)
  const accuracyScore = accuracy * 0.5;
  const speedScore = Math.max(0, Math.min(25, (100 - avgTime) * 0.5));
  const volumeScore = Math.min(25, totalSolved * 2.5);
  const difficultyRaw = Math.round(accuracyScore + speedScore + volumeScore);
  const challengeLevelNumber = (Math.max(10, Math.min(100, difficultyRaw)) / 10).toFixed(1);

  const adaptive_difficulty = {
    score: difficultyRaw,
    challenge_level: `${challengeLevelNumber} / 10`,
    tier: difficultyRaw > 80 ? 'Advanced' as const : difficultyRaw > 60 ? 'Intermediate' as const : 'Foundation' as const,
    adaptation_rationale: `Difficulty adapted automatically from your ${accuracy}% accuracy rate, ${avgTime}s average solving pace, and ${totalSolved} logged attempts.`,
    accuracy_factor: Math.round(accuracyScore),
    speed_factor: Math.round(speedScore),
    consistency_factor: Math.round(volumeScore)
  };

  // Concept Dependency Map (Prerequisite relationship graph)
  const concept_map = [
    {
      id: "linear_eq",
      name: "Linear Equations",
      category: "Algebra",
      mastery_percentage: 92,
      status: "Mastered" as const,
      accuracy: 92,
      avg_time_sec: 34,
      recent_mistakes: ["Occasional sign flip on transposition"],
      prerequisites: [],
      recommended_practice: "Practice 3 equations with fraction coefficients"
    },
    {
      id: "factorisation",
      name: "Factorisation & Expansion",
      category: "Algebra",
      mastery_percentage: 57,
      status: "Developing" as const,
      accuracy: 64,
      avg_time_sec: 58,
      recent_mistakes: ["Parentheses distribution omission", "Splitting the middle term error"],
      prerequisites: ["Linear Equations"],
      recommended_practice: "Practice 4 distributive law and grouping problems"
    },
    {
      id: "quadratics",
      name: "Quadratic Equations",
      category: "Algebra",
      mastery_percentage: 48,
      status: "Needs Practice" as const,
      accuracy: 50,
      avg_time_sec: 72,
      recent_mistakes: ["Freshman's dream (a+b)^2 = a^2+b^2", "Discriminant sign error"],
      prerequisites: ["Linear Equations", "Factorisation & Expansion"],
      recommended_practice: "Strengthen factorisation before attempting advanced quadratics"
    },
    {
      id: "completing_square",
      name: "Completing the Square",
      category: "Algebra",
      mastery_percentage: 32,
      status: "Locked" as const,
      accuracy: 35,
      avg_time_sec: 90,
      recent_mistakes: ["Forgot to divide by 2 before squaring"],
      prerequisites: ["Quadratic Equations", "Factorisation & Expansion"],
      recommended_practice: "Master Quadratic Equations first"
    },
    {
      id: "pythagoras",
      name: "Pythagorean Theorem",
      category: "Geometry",
      mastery_percentage: 94,
      status: "Mastered" as const,
      accuracy: 96,
      avg_time_sec: 38,
      recent_mistakes: [],
      prerequisites: [],
      recommended_practice: "Try 3D space diagonal problems"
    },
    {
      id: "fractions_ratios",
      name: "Fractions & Proportions",
      category: "Arithmetic",
      mastery_percentage: 68,
      status: "Developing" as const,
      accuracy: 70,
      avg_time_sec: 45,
      recent_mistakes: ["Adding denominators directly across"],
      prerequisites: [],
      recommended_practice: "LCM common unit conversions"
    }
  ];

  // True Multi-Factor Concept Mastery
  const mastery_scores = [
    {
      concept: "Linear Equations",
      score: 92,
      status: "Mastered" as const,
      explanation: "Consistently fast (<40s), high accuracy across single-step and two-step equations.",
      accuracy: 92,
      speed: "Fast (34s avg)",
      consistency: "Very High"
    },
    {
      concept: "Pythagorean Theorem",
      score: 94,
      status: "Mastered" as const,
      explanation: "Flawless identification of hypotenuse vs legs with reliable square root evaluation.",
      accuracy: 96,
      speed: "Optimal (38s avg)",
      consistency: "Very High"
    },
    {
      concept: "Geometry & Area",
      score: 85,
      status: "Proficient" as const,
      explanation: "Good formula retention for circles and polygons; minor rounding inconsistencies.",
      accuracy: 85,
      speed: "Good (42s avg)",
      consistency: "High"
    },
    {
      concept: "Fractions & Proportions",
      score: 68,
      status: "Developing" as const,
      explanation: "Good when denominators match; struggles when finding least common denominators.",
      accuracy: 70,
      speed: "Average (45s avg)",
      consistency: "Moderate"
    },
    {
      concept: "Factorisation",
      score: 57,
      status: "Developing" as const,
      explanation: "Identifies common monomials well, but drops negative signs during binomial grouping.",
      accuracy: 64,
      speed: "Paced (58s avg)",
      consistency: "Moderate"
    },
    {
      concept: "Quadratic Equations",
      score: 48,
      status: "Beginner" as const,
      explanation: "Root cause is prerequisite factorisation gap. Resolving factorisation will unlock quadratics.",
      accuracy: 50,
      speed: "Slow (72s avg)",
      consistency: "Needs Improvement"
    }
  ];

  // Dynamic Learning Path Roadmap
  const learning_path = {
    stages: [
      {
        id: "lp_1",
        title: "Linear Equations & Balances",
        status: "Mastered" as const,
        progress: 100,
        description: "One and two-variable algebraic isolation with inverse operations.",
        practiceProblem: "3x - 7 = 14"
      },
      {
        id: "lp_2",
        title: "Factorisation & Distributive Law",
        status: "Developing" as const,
        progress: 57,
        description: "Parentheses distribution, common factors, and binomial expansion.",
        isCurrentTarget: true,
        practiceProblem: "3(x - 4) = 15"
      },
      {
        id: "lp_3",
        title: "Quadratic Equations & Roots",
        status: "Needs Practice" as const,
        progress: 48,
        description: "Factoring quadratics, completing square, and quadratic formula.",
        practiceProblem: "x^2 - 5x + 6 = 0"
      },
      {
        id: "lp_4",
        title: "Advanced Algebraic Systems",
        status: "Locked" as const,
        progress: 0,
        description: "Simultaneous non-linear systems and polynomial roots.",
        practiceProblem: "x^3 - 4x = 0"
      }
    ],
    recommended_next_step: "Strengthen factorisation before attempting advanced quadratic equations."
  };

  // Achievements Badges
  const achievements = [
    {
      id: "first_step",
      title: "First Step",
      description: "Solved your first math problem on MathMentor",
      icon: "🏅",
      unlocked: true,
      unlocked_at: "2026-08-05"
    },
    {
      id: "streak_5",
      title: "5-Day Learner",
      description: "Maintained an active daily learning streak",
      icon: "🔥",
      unlocked: true,
      unlocked_at: "2026-08-10"
    },
    {
      id: "concept_master",
      title: "Concept Master",
      description: "Achieved Mastered status in Linear Equations",
      icon: "🧠",
      unlocked: true,
      unlocked_at: "2026-08-08"
    },
    {
      id: "speed_solver",
      title: "Speed Solver",
      description: "Solved a problem in under 30 seconds using speed shortcut",
      icon: "⚡",
      unlocked: true,
      unlocked_at: "2026-08-09"
    },
    {
      id: "mistake_breaker",
      title: "Mistake Breaker",
      description: "Corrected and avoided a predicted transposition sign error",
      icon: "🎯",
      unlocked: true,
      unlocked_at: "2026-08-11"
    },
    {
      id: "algebra_pro",
      title: "Algebra Master",
      description: "Maintained >90% accuracy across 5 consecutive problems",
      icon: "🏆",
      unlocked: true,
      unlocked_at: "2026-08-11"
    }
  ];

  // Mistake Prediction for Next Problem
  const predicted_mistake_for_next = {
    problem_text: "2x + 5 = 17",
    predicted_mistake: "Sign error while transposing constant across '='",
    reason: "Based on your previous attempts, you may be likely to make a sign error while rearranging this equation.",
    risk_level: "Medium" as const
  };

  // Smart Feedback Loop
  const smart_feedback = {
    what_improved: "Accuracy improved from 72% → 81% on linear equations.",
    what_needs_attention: "Sign errors while transposing positive terms across '='.",
    what_to_practice_next: "Medium-level linear equations with parentheses and inverse balancing.",
    accuracy_delta: "+9%",
    mistakes_avoided: "2 sign errors avoided in recent session"
  };

  return {
    accuracy_percentage: accuracy,
    avg_solving_time_sec: avgTime,
    total_problems_solved: totalSolved,
    strongest_topic: strongestTopic,
    needs_improvement_topic: needsImprovementTopic,
    learning_dna: learningDna,
    accuracy_history,
    speed_history,
    mistake_replays,
    todays_mission,
    recent_thinking_analyses,
    misconceptions_radar,
    adaptive_difficulty,
    concept_map,
    mastery_scores,
    learning_path,
    achievements,
    streak_days: 5,
    predicted_mistake_for_next,
    smart_feedback
  };
}

export async function recordThinkingAnalysis(analysis: ThinkingAnalysisResult): Promise<number> {
  const database = await getDb();

  database.run(
    `INSERT INTO thinking_analyses (
      problem, student_steps, is_fully_correct, overall_status, detected_issue,
      likely_misconception, misconception_category, why_mistake_happened,
      better_thinking_strategy, flawed_mental_model, healthy_mental_model,
      step_audit_json, corrected_expert_path_json, remediation_question,
      remediation_hint, remediation_answer
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      analysis.problem,
      analysis.student_steps,
      analysis.is_fully_correct ? 1 : 0,
      analysis.overall_status,
      analysis.detected_issue,
      analysis.likely_misconception,
      analysis.misconception_category,
      analysis.why_mistake_happened,
      analysis.better_thinking_strategy,
      analysis.cognitive_reframing?.flawed_mental_model || '',
      analysis.cognitive_reframing?.healthy_mental_model || '',
      JSON.stringify(analysis.step_by_step_audit || []),
      JSON.stringify(analysis.corrected_expert_path || []),
      analysis.remediation_challenge?.question || '',
      analysis.remediation_challenge?.hint || '',
      analysis.remediation_challenge?.expected_answer || ''
    ]
  );

  // Also log attempt in attempts table
  database.run(
    `INSERT INTO attempts (problem_text, topic, difficulty, correct, solving_time_sec, mistake_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      analysis.problem,
      analysis.misconception_category || 'Algebra',
      'Medium',
      analysis.is_fully_correct ? 1 : 0,
      40,
      analysis.is_fully_correct ? null : analysis.misconception_category
    ]
  );

  saveDb();

  const idRes = database.exec('SELECT last_insert_rowid()');
  return (idRes[0]?.values[0]?.[0] as number) || 1;
}

export async function getRecentThinkingAnalyses(limit: number = 10): Promise<ThinkingAnalysisResult[]> {
  const database = await getDb();
  const res = database.exec(`
    SELECT id, problem, student_steps, is_fully_correct, overall_status, detected_issue,
           likely_misconception, misconception_category, why_mistake_happened,
           better_thinking_strategy, flawed_mental_model, healthy_mental_model,
           step_audit_json, corrected_expert_path_json, remediation_question,
           remediation_hint, remediation_answer, strftime('%Y-%m-%d %H:%M', created_at) as dt
    FROM thinking_analyses
    ORDER BY created_at DESC
    LIMIT ${Number(limit) || 10}
  `);

  const list: ThinkingAnalysisResult[] = [];
  if (res[0]?.values) {
    for (const r of res[0].values) {
      try {
        list.push({
          id: r[0] as number,
          problem: r[1] as string,
          student_steps: r[2] as string,
          is_fully_correct: Boolean(r[3]),
          overall_status: r[4] as any,
          detected_issue: r[5] as string,
          likely_misconception: r[6] as string,
          misconception_category: r[7] as any,
          why_mistake_happened: r[8] as string,
          better_thinking_strategy: r[9] as string,
          cognitive_reframing: {
            flawed_mental_model: (r[10] as string) || '',
            healthy_mental_model: (r[11] as string) || ''
          },
          step_by_step_audit: r[12] ? JSON.parse(r[12] as string) : [],
          corrected_expert_path: r[13] ? JSON.parse(r[13] as string) : [],
          remediation_challenge: {
            question: (r[14] as string) || '',
            hint: (r[15] as string) || '',
            expected_answer: (r[16] as string) || ''
          },
          created_at: r[17] as string
        });
      } catch (e) {
        console.warn('Error mapping thinking row:', e);
      }
    }
  }
  return list;
}

export async function recordMethodBattleChoice(choice: {
  problem_text: string;
  chosen_method_id: string;
  recommended_method_id: string;
  chosen_method_title: string;
  recommended_method_title: string;
  analysis_feedback: string;
  was_optimal: boolean;
}) {
  const database = await getDb();
  database.run(
    `INSERT INTO method_battles (
      problem_text, chosen_method_id, recommended_method_id,
      chosen_method_title, recommended_method_title, analysis_feedback, was_optimal
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      choice.problem_text,
      choice.chosen_method_id,
      choice.recommended_method_id,
      choice.chosen_method_title,
      choice.recommended_method_title,
      choice.analysis_feedback,
      choice.was_optimal ? 1 : 0
    ]
  );
  saveDb();
}

export async function recordMistakePredictionOutcome(outcome: {
  problem_text: string;
  predicted_mistake: string;
  confirmed: boolean;
  avoided: boolean;
  actual_mistake?: string;
}) {
  const database = await getDb();
  database.run(
    `INSERT INTO mistake_predictions (
      problem_text, predicted_mistake, reason, risk_level,
      was_tested, confirmed, avoided, actual_mistake
    ) VALUES (?, ?, 'Historical trend validation', 'Medium', 1, ?, ?, ?)`,
    [
      outcome.problem_text,
      outcome.predicted_mistake,
      outcome.confirmed ? 1 : 0,
      outcome.avoided ? 1 : 0,
      outcome.actual_mistake || null
    ]
  );
  saveDb();
}

export async function recordSocraticSession(session: {
  problem_text: string;
  total_turns: number;
  hints_used: number;
  solved: boolean;
}) {
  const database = await getDb();
  database.run(
    `INSERT INTO socratic_sessions (problem_text, total_turns, hints_used, solved)
     VALUES (?, ?, ?, ?)`,
    [
      session.problem_text,
      session.total_turns,
      session.hints_used,
      session.solved ? 1 : 0
    ]
  );
  saveDb();
}

export async function recordCoachMessage(sender: 'student' | 'coach', message: string, contextJson?: string) {
  const database = await getDb();
  database.run(
    `INSERT INTO coach_messages (sender, message, context_json) VALUES (?, ?, ?)`,
    [sender, message, contextJson || null]
  );
  saveDb();
}

export async function getCoachMessages(limit: number = 20) {
  const database = await getDb();
  const res = database.exec(`
    SELECT sender, message, context_json, strftime('%Y-%m-%d %H:%M', created_at) as dt
    FROM coach_messages
    ORDER BY created_at ASC
    LIMIT ${limit}
  `);

  const list: { sender: 'student' | 'coach'; message: string; timestamp: string }[] = [];
  if (res[0]?.values) {
    for (const r of res[0].values) {
      list.push({
        sender: r[0] as any,
        message: r[1] as string,
        timestamp: r[3] as string
      });
    }
  }
  return list;
}
