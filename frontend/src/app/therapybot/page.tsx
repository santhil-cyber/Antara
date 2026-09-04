'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Heart,
  Sparkles,
  Wind,
  PhoneCall,
  Send,
  RotateCcw,
  ShieldCheck,
  Smile,
  Compass,
  Volume2,
  ChevronRight,
  AlertCircle,
  X,
  MessageCircleHeart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const therapySuggestions = [
  {
    title: 'Anxiety & Overwhelm',
    prompt: 'I feel deeply overwhelmed and anxious right now. Can you help me calm down?',
    icon: <Wind className="text-emerald-500" size={18} />,
    badge: 'Calming',
  },
  {
    title: 'Grounding Exercise',
    prompt: 'Can you guide me through a 5-4-3-2-1 sensory grounding exercise step-by-step?',
    icon: <Compass className="text-teal-500" size={18} />,
    badge: 'Exercise',
  },
  {
    title: 'Safe Space to Vent',
    prompt: 'I have been through a lot of emotional stress and just need someone kind to listen without judgment.',
    icon: <Smile className="text-rose-500" size={18} />,
    badge: 'Emotional Care',
  },
  {
    title: 'Safety & Protection Advice',
    prompt: 'I feel unsafe in my personal environment. What immediate steps should I take to protect myself?',
    icon: <ShieldCheck className="text-blue-500" size={18} />,
    badge: 'Protection',
  },
];

const crisisHelplines = [
  {
    name: 'National Women Helpline',
    number: '1091',
    desc: 'Toll-free 24/7 dedicated support for women in distress.',
    badge: 'Immediate Help',
  },
  {
    name: 'National Emergency Response',
    number: '112',
    desc: 'All-in-one emergency service across India.',
    badge: 'Police / Ambulance',
  },
  {
    name: 'Tele-MANAS Mental Health',
    number: '14416',
    desc: 'Govt. 24/7 tele-mental health counseling & psychiatric support.',
    badge: 'Counseling',
  },
  {
    name: 'Vandrevala Foundation',
    number: '+91 9999 666 555',
    desc: 'Free 24/7 emotional crisis and suicide prevention helpline.',
    badge: 'Crisis Support',
  },
];

export default function TherapyBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      content:
        "Hello, I am **Antara's Therapy Bot**. 🌸\n\nI am here to provide a safe, gentle, and confidential space for your heart and mind. Whether you are dealing with anxiety, heartbreak, domestic distress, or simply need someone to listen, you are not alone.\n\nTake a slow, deep breath. How are you feeling today?",
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Breathing pacer effect
  useEffect(() => {
    if (!showBreathingModal) return;

    let timer = 4;
    let phase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';
    setBreathPhase('Inhale');
    setBreathTimer(4);

    const interval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        if (phase === 'Inhale') {
          phase = 'Hold';
          timer = 7;
        } else if (phase === 'Hold') {
          phase = 'Exhale';
          timer = 8;
        } else {
          phase = 'Inhale';
          timer = 4;
        }
        setBreathPhase(phase);
      }
      setBreathTimer(timer);
    }, 1000);

    return () => clearInterval(interval);
  }, [showBreathingModal]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build history for context
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/therapy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      const data = await res.json();
      const botReply =
        data.reply ||
        "I hear you, and your feelings are valid. Take a gentle breath—I am right here with you.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Therapy Bot send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content:
            "I'm here with you. Even if technology stumbles, your feelings matter. Please take a slow breath and share whatever is on your mind.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content:
          "Welcome back. A fresh start for your mind. Whenever you are ready, I'm here to listen. 🌸",
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-6xl mx-auto w-full px-4 py-3">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-rose-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl p-4 mb-3 border border-emerald-100 dark:border-gray-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-200 dark:shadow-none animate-pulse">
            <Heart size={24} className="fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl text-gray-800 dark:text-gray-100">
                Antara Therapy Bot
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full">
                Gemini 2.5 Flash
              </span>
              <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Compassionate, trauma-informed emotional care & grounding companion
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBreathingModal(true)}
            className="flex items-center gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950 rounded-xl"
          >
            <Wind size={15} />
            <span className="text-xs font-medium">Breathe (4-7-8)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelplineModal(true)}
            className="flex items-center gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950 rounded-xl"
          >
            <PhoneCall size={15} />
            <span className="text-xs font-medium">Emergency Helplines</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            title="Reset Conversation"
            className="text-gray-500 hover:text-gray-700 rounded-xl"
          >
            <RotateCcw size={15} />
          </Button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow'
                }`}
              >
                {msg.role === 'user' ? 'You' : <Heart size={14} className="fill-white" />}
              </div>

              <div
                className={`max-w-[82%] md:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-emerald-50/70 dark:bg-gray-800 border border-emerald-100/80 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none text-inherit">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <div
                  className={`mt-2 text-[10px] text-right ${
                    msg.role === 'user'
                      ? 'text-blue-200'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking animation */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shrink-0">
                <Heart size={14} className="fill-white animate-pulse" />
              </div>
              <div className="bg-emerald-50/70 dark:bg-gray-800 border border-emerald-100/80 dark:border-gray-700 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center gap-2">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  Antara is listening with care...
                </span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions Bar (when 1 or 2 messages) */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1 font-medium">
              <Sparkles size={13} className="text-amber-500" />
              Suggested Care Topics:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {therapySuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60 hover:bg-emerald-50/60 dark:hover:bg-gray-700/80 hover:border-emerald-300 text-left transition duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {item.prompt}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-gray-400 group-hover:text-emerald-600 shrink-0 ml-1"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-gray-50/90 dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tell me what you're experiencing... (I'm here to listen without judgment)"
              className="flex-1 bg-white dark:bg-gray-800 rounded-xl border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 text-sm py-5"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl px-5 h-11 shadow-sm font-semibold flex items-center gap-1.5 transition"
            >
              <Send size={16} />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </form>
          <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-gray-400">
            <span>Antara is an AI companion for emotional support, not a replacement for clinical psychiatry.</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Safe & Confidential</span>
          </div>
        </div>
      </div>

      {/* Breathing Exercise Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center">
            <button
              onClick={() => setShowBreathingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1">
              4-7-8 Calming Breath
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Inhale peace for 4s, hold gently for 7s, release tension for 8s.
            </p>

            {/* Breathing Visualizer Circle */}
            <div className="relative w-44 h-44 flex items-center justify-center my-4">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-110 bg-emerald-100 dark:bg-emerald-950/70 border-4 border-emerald-400'
                    : breathPhase === 'Hold'
                    ? 'scale-110 bg-teal-100 dark:bg-teal-950/70 border-4 border-teal-400 animate-pulse'
                    : 'scale-90 bg-rose-50 dark:bg-rose-950/50 border-4 border-rose-300'
                }`}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-200">
                  {breathPhase}
                </span>
                <span className="text-3xl font-black text-gray-700 dark:text-gray-100 mt-1">
                  {breathTimer}s
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mt-3">
              {breathPhase === 'Inhale' && 'Breathe in slowly through your nose...'}
              {breathPhase === 'Hold' && 'Hold gently and soften your shoulders...'}
              {breathPhase === 'Exhale' && 'Exhale fully through your mouth with a soft sigh...'}
            </p>

            <Button
              onClick={() => setShowBreathingModal(false)}
              className="mt-6 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              Return to Chat
            </Button>
          </div>
        </div>
      )}

      {/* Emergency Helpline Modal */}
      {showHelplineModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowHelplineModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 mb-2">
              <AlertCircle size={22} />
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                24/7 Crisis & Emergency Helplines
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              If you or someone you know is in immediate danger, please reach out to dedicated responders right away.
            </p>

            <div className="space-y-2.5">
              {crisisHelplines.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <a
                    href={`tel:${item.number.replace(/\s+/g, '')}`}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow shrink-0 transition"
                  >
                    <PhoneCall size={13} />
                    {item.number}
                  </a>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowHelplineModal(false)}
              className="mt-5 w-full rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
