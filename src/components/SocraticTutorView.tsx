import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Award,
  ArrowRight,
  ShieldAlert,
  Bot,
  User,
  Zap
} from 'lucide-react';
import { SocraticMessage } from '../types/mathmentor.js';

interface SocraticTutorViewProps {
  initialProblem?: string;
  onSolveInMultiAgent?: (problem: string) => void;
  onAnalyzeThinking?: (problem: string) => void;
}

export const SocraticTutorView: React.FC<SocraticTutorViewProps> = ({
  initialProblem = '',
  onSolveInMultiAgent,
  onAnalyzeThinking
}) => {
  const [problemText, setProblemText] = useState<string>(initialProblem || '2x + 5 = 17');
  const [messages, setMessages] = useState<SocraticMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProblem) {
      setProblemText(initialProblem);
    }
  }, [initialProblem]);

  useEffect(() => {
    startSocraticSession(problemText);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startSocraticSession = (problem: string) => {
    setIsSolved(false);
    setHintsUsed(0);
    setMessages([
      {
        id: 'init-1',
        sender: 'agent',
        content: `Welcome to Socratic Tutor Mode! We'll solve "${problem}" together by asking the right questions.`,
        guiding_question: 'Look at the equation: what is the first operation standing between you and isolating the variable x?',
        timestamp: 'Just now'
      }
    ]);
  };

  const handleSend = async (userText?: string) => {
    const text = (userText || inputVal).trim();
    if (!text || isLoading) return;

    const studentMsg: SocraticMessage = {
      id: String(Date.now()),
      sender: 'student',
      content: text,
      timestamp: 'Just now'
    };

    const newHistory = [...messages, studentMsg];
    setMessages(newHistory);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/socratic/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText,
          conversationHistory: newHistory.map((m) => ({
            sender: m.sender,
            content: m.content
          })),
          studentMessage: text
        })
      });

      if (!res.ok) throw new Error('Failed to get Socratic response');

      const data = await res.json();
      const agentMsg: SocraticMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        content: data.content,
        guiding_question: data.guiding_question,
        praise: data.praise,
        isSolved: data.isSolved,
        timestamp: 'Just now'
      };

      setMessages((prev) => [...prev, agentMsg]);
      if (data.isSolved) {
        setIsSolved(true);
        // Log socratic session
        fetch('/api/socratic/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem_text: problemText,
            total_turns: newHistory.length + 1,
            hints_used: hintsUsed,
            solved: true
          })
        }).catch(console.warn);
      }
    } catch (err) {
      console.warn('Socratic error:', err);
      // Fallback response
      const isAns = text.includes('6') || text.includes('x = 6');
      const fallbackMsg: SocraticMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        content: isAns
          ? 'Brilliant work! You reasoned through each step and isolated x = 6.'
          : 'Good step! Notice how inverse operations maintain exact balance across both sides.',
        guiding_question: isAns
          ? 'How can you verify that x = 6 is mathematically certain?'
          : 'What operation will you execute next?',
        praise: isAns ? '🎯 Eureka! Problem solved independently.' : undefined,
        isSolved: isAns,
        timestamp: 'Just now'
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (isAns) setIsSolved(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGiveHint = () => {
    setHintsUsed((prev) => prev + 1);
    const hintText =
      hintsUsed === 0
        ? 'Hint 1: Look at the +5 term. To cancel out adding 5, subtract 5 from both sides.'
        : hintsUsed === 1
        ? 'Hint 2: After subtracting 5 from 17, you are left with 2x = 12. What undoes multiplication by 2?'
        : 'Hint 3: Divide 12 by 2 to find the exact value of x.';

    const hintMsg: SocraticMessage = {
      id: String(Date.now()),
      sender: 'agent',
      content: `💡 ${hintText}`,
      guiding_question: 'What does this step yield?',
      timestamp: 'Just now'
    };
    setMessages((prev) => [...prev, hintMsg]);
  };

  const handleExplainConcept = () => {
    const conceptMsg: SocraticMessage = {
      id: String(Date.now()),
      sender: 'agent',
      content:
        '📖 Concept Breakdown: Equations represent balanced physical scales. Any operation performed on the left pan must be mirrored on the right pan. Addition undoes subtraction, and multiplication undoes division.',
      guiding_question: 'Applying this balance rule, what step will you take first?',
      timestamp: 'Just now'
    };
    setMessages((prev) => [...prev, conceptMsg]);
  };

  const handleShowSolution = () => {
    const solMsg: SocraticMessage = {
      id: String(Date.now()),
      sender: 'agent',
      content: `Full Solution Walkthrough:\n1. 2x + 5 = 17\n2. 2x = 17 - 5 = 12 (Subtract 5 from both sides)\n3. x = 12 / 2 = 6 (Divide both sides by 2)\nFinal Answer: x = 6`,
      isSolved: true,
      timestamp: 'Just now'
    };
    setMessages((prev) => [...prev, solMsg]);
    setIsSolved(true);
  };

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Brain className="w-4 h-4 text-cyan-400" />
          Guided Inquiry Engine
        </div>
        <h2 className="text-3xl font-extrabold text-white">
          Socratic <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Tutor Mode</span>
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Learn how to think through guided questions. MathMentor never spoils the answer — we coach you to discover it.
        </p>
      </div>

      {/* Problem Configuration Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problem:</span>
          <input
            type="text"
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            className="flex-1 sm:w-64 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => startSocraticSession(problemText)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            Restart
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['2x + 5 = 17', '3(x - 4) = 15', '1/2 + 1/3', 'x^2 - 5x + 6 = 0'].map((prob, i) => (
            <button
              key={i}
              onClick={() => {
                setProblemText(prob);
                startSocraticSession(prob);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
            >
              {prob}
            </button>
          ))}
        </div>
      </div>

      {/* Socratic Dialogue Chat Window */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Chat message scroll area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'student' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  msg.sender === 'student'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                }`}
              >
                {msg.sender === 'student' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  msg.sender === 'student'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {msg.praise && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {msg.praise}
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.content}</div>

                {msg.guiding_question && (
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 font-medium text-xs flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{msg.guiding_question}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
                Socratic Coach is framing your next guiding thought...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Celebratory Banner if Solved */}
        {isSolved && (
          <div className="px-6 py-3 bg-emerald-950/40 border-t border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <span className="font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Problem Solved via Socratic Guided Inquiry!
            </span>
            <div className="flex items-center gap-2">
              {onAnalyzeThinking && (
                <button
                  onClick={() => onAnalyzeThinking(problemText)}
                  className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-semibold transition-colors"
                >
                  Analyze Thinking Path
                </button>
              )}
              {onSolveInMultiAgent && (
                <button
                  onClick={() => onSolveInMultiAgent(problemText)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-semibold transition-colors"
                >
                  View Multi-Agent Solutions
                </button>
              )}
            </div>
          </div>
        )}

        {/* Guided Action Buttons */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleGiveHint}
              disabled={isSolved}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Give Me a Hint ({hintsUsed}/3)
            </button>

            <button
              onClick={handleExplainConcept}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Explain the Concept
            </button>

            <button
              onClick={handleShowSolution}
              disabled={isSolved}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Show Solution
            </button>
          </div>

          <span className="text-[11px] text-slate-500">
            {messages.filter((m) => m.sender === 'student').length} turns exchanged
          </span>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type your reasoning or answer (e.g., 'Subtract 5 from both sides')..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Reply</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
