import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  Trash2,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { ChatMessage, GeminiChatModel, Project, Clip } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onApplyPreset?: (presetName: string) => void;
}

const QUICK_PROMPTS = [
  'Suggest the best transition sequence for a high-energy cyberpunk reel',
  'Write 3 punchy kinetic typography titles for a tech product launch',
  'What animations should I combine with a 3D cube rotate transition?',
  'Give me a creative prompt for 4K background generation',
];

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-welcome',
      role: 'model',
      content:
        'Hello! I am your **MotionCraft AI Director** powered by Gemini. Ask me for transition recipes, animation choreography, kinetic typography ideas, or video pacing tips for your project!',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [model, setModel] = useState<GeminiChatModel>('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const systemInstruction = `You are MotionCraft AI Video & Animation Director. You give creative, concise, high-impact advice on motion design, transitions (crossfade, glitch, wipes, 3D cube, zoom), animations (pop, kinetic scale, elastic bounce, floating), sound effects, and timing. Current project has ${project.clips.length} clips with aspect ratio ${project.aspectRatio} and duration ${project.duration}s.`;

      const response = await sendChatMessage(newHistory, model, systemInstruction);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: Date.now(),
      };
      setMessages([...newHistory, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Error: ${err.message || 'Failed to contact Gemini'}. Please check API key status in AI Studio secrets.`,
        timestamp: Date.now(),
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'init-welcome-reset',
        role: 'model',
        content: 'Conversation cleared. What motion design challenge can I assist you with?',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <aside className="fixed top-16 right-0 bottom-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-40">
      {/* Drawer Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-925">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Gemini AI Director</span>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-1 rounded border border-purple-500/30">
                Multi-Turn
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Choreography & Motion Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Selector Banner */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px] font-medium">Model:</span>
        <select
          id="select-gemini-chat-model"
          value={model}
          onChange={(e) => setModel(e.target.value as GeminiChatModel)}
          className="bg-slate-850 text-slate-200 text-xs font-mono px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-purple-500"
        >
          <option value="gemini-3.5-flash">gemini-3.5-flash (Fast)</option>
          <option value="gemini-2.5-pro">gemini-2.5-pro (Reasoning)</option>
        </select>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-cyan-500 text-slate-950' : 'bg-purple-600 text-white'
                }`}
              >
                {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60 whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <div className="w-6 h-6 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>Gemini is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="px-3 py-2 border-t border-slate-800 bg-slate-925/50">
        <div className="flex items-center space-x-1 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Quick Inspiration</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/60 truncate max-w-[200px] transition"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-925">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            id="input-gemini-chat"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Gemini about transitions, pacing..."
            className="flex-1 bg-slate-950 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            id="btn-send-gemini-chat"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition shadow-md shadow-purple-600/25"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
