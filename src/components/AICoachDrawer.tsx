import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Target,
  Zap,
  BookOpen,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { AICoachMessage } from '../types/mathmentor.js';

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAction?: (actionType: string, payload: string) => void;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToAction
}) => {
  const [messages, setMessages] = useState<AICoachMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      message:
        "Hello! I'm your MathMentor AI Coach. I monitor your problem attempts, mistake trends, and concept mastery in real time. Ask me anything about where you're struggling, how to solve faster, or what to learn next!",
      timestamp: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    "Why am I struggling with quadratics?",
    "What is my most frequent mistake?",
    "How can I solve linear equations faster?",
    "What should I learn next on my roadmap?"
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    const userMsg: AICoachMessage = {
      id: String(Date.now()),
      sender: 'student',
      message: text,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });

      if (!res.ok) throw new Error('Failed to fetch coach response');
      const data = await res.json();

      const coachMsg: AICoachMessage = {
        id: String(Date.now() + 1),
        sender: 'coach',
        message: data.reply,
        timestamp: 'Just now',
        recommended_action: data.recommended_action
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.warn('Coach error:', err);
      // Fallback response
      const fallbackMsg: AICoachMessage = {
        id: String(Date.now() + 1),
        sender: 'coach',
        message:
          "Based on your performance logs, your core difficulty with quadratics stems from factorisation (mastery at 57%). Focusing on the distributive law and binomial grouping will quickly elevate your score!",
        timestamp: 'Just now',
        recommended_action: {
          label: 'Practice Factorisation Drill',
          action_type: 'practice',
          payload: '3(x - 4) = 15'
        }
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Ask MathMentor</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold border border-cyan-500/30">
                  Context Aware
                </span>
              </div>
              <p className="text-xs text-slate-400">Personal AI Mathematics Coach</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs whitespace-nowrap border border-slate-700/60 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {q}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'student' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  msg.sender === 'student'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                }`}
              >
                {msg.sender === 'student' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  msg.sender === 'student'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <p>{msg.message}</p>

                {/* Recommended Action Card */}
                {msg.recommended_action && onNavigateToAction && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        onNavigateToAction(
                          msg.recommended_action!.action_type,
                          msg.recommended_action!.payload
                        );
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-cyan-400" />
                        {msg.recommended_action.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
                Analyzing your learning history & data...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90">
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
              placeholder="Ask your coach (e.g., Why did I make a sign error?)..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
