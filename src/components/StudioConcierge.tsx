import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, ArrowRight, MessageSquare, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { getAjaContextualResponse } from '../data/ajaKnowledge';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  action?: {
    type: 'builder' | 'enquiry' | 'pricing';
    label: string;
  };
}

interface StudioConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBuilder: () => void;
}

export const StudioConcierge: React.FC<StudioConciergeProps> = ({
  isOpen,
  onClose,
  onOpenBuilder,
}) => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: "Hello! Welcome to ArkAja Studio. I'm Aja, your personal creative advisor.\n\nWhether you're developing a beauty label, styling an ethnic or fashion collection, or establishing your brand's presence across social feeds, I'm here to chat about our services, explain our AI-assisted production with human art direction, or help you craft the perfect project brief. How can I assist your brand today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'What services do you offer?',
    'Explain AI + human art direction',
    'Which package fits my budget?',
    'What is your creative process?',
    'How do I start a project?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      // Set 3.5s timeout abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      const replyText = data.reply || getAjaContextualResponse(textToSend);

      // Check if reply suggests starting a project or enquiry
      const lower = replyText.toLowerCase();
      let action: ChatMessage['action'] = undefined;
      if (lower.includes('project builder') || lower.includes('build your project') || lower.includes('custom project')) {
        action = { type: 'builder', label: 'Launch Project Builder →' };
      } else if (lower.includes('enquiry') || lower.includes('brief') || lower.includes('quote')) {
        action = { type: 'enquiry', label: 'Fill Enquiry Form →' };
      }

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      console.warn('Client fallback triggered:', err);
      const fallbackReply = getAjaContextualResponse(textToSend);
      const lower = fallbackReply.toLowerCase();
      let action: ChatMessage['action'] = undefined;
      if (lower.includes('project builder') || lower.includes('build your project') || lower.includes('custom project')) {
        action = { type: 'builder', label: 'Launch Project Builder →' };
      } else if (lower.includes('enquiry') || lower.includes('brief') || lower.includes('quote')) {
        action = { type: 'enquiry', label: 'Fill Enquiry Form →' };
      }

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };
      setMessages((prev) => [...prev, modelMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: ChatMessage['action']) => {
    if (!action) return;
    onClose();
    if (action.type === 'builder') {
      const el = document.getElementById('builder');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onOpenBuilder();
    } else if (action.type === 'enquiry') {
      const el = document.getElementById('enquire');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[440px] max-h-[85vh] h-[660px] flex flex-col border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 transition-colors ${
        isDark
          ? 'bg-[#111317] border-[#2E333B] text-[#F3F1EC]'
          : 'bg-[#FFFFFF] border-[#DDD7CD] text-[#14171A]'
      }`}
      role="dialog"
      aria-label="Aja ArkAja Studio Advisor"
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'bg-[#14171d] border-[#24272D]' : 'bg-[#FAF8F5] border-[#E5E0D6]'
        }`}
      >
        <div className="flex items-center gap-3">
          <Logo variant="full" size="sm" />
          <div className="h-5 w-[1px] bg-inherit opacity-30" />
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-base font-medium tracking-wide">
              Aja
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className={`text-[8.5px] font-mono tracking-widest uppercase px-1.5 py-0.5 border ${
                isDark
                  ? 'text-[#D8C7A5] bg-[#1e222b] border-[#D8C7A5]/30'
                  : 'text-[#8C723E] bg-[#F7F3EA] border-[#8C723E]/30'
              }`}
            >
              ADVISOR
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-1.5 transition-colors ${
            isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7B818F] hover:text-[#14171A]'
          }`}
          aria-label="Close Advisor"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-light">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3.5 leading-relaxed rounded-none ${
                  isUser
                    ? isDark
                      ? 'bg-[#F3F1EC] text-[#0b0c0e] font-normal shadow-sm'
                      : 'bg-[#9E824C] text-[#FFFFFF] font-normal shadow-sm'
                    : isDark
                    ? 'bg-[#181b22] text-[#E5E2D9] border border-[#24272D]'
                    : 'bg-[#F9F7F3] text-[#2C3038] border border-[#E5E0D6]'
                }`}
              >
                {/* Clean formatted lines */}
                <div className="space-y-2">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {paragraph.split('\n').map((line, lIdx) => {
                        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
                        // Process **bold** markers
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <span
                            key={lIdx}
                            className={`block ${isBullet ? 'pl-2 py-0.5' : ''}`}
                          >
                            {parts.map((part, i) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong
                                    key={i}
                                    className={`font-semibold ${
                                      isUser
                                        ? 'text-inherit'
                                        : isDark
                                        ? 'text-[#FAF8F5]'
                                        : 'text-[#14171A]'
                                    }`}
                                  >
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </span>
                        );
                      })}
                    </p>
                  ))}
                </div>

                {/* Optional embedded action button */}
                {msg.action && (
                  <div className="mt-3 pt-2.5 border-t border-inherit">
                    <button
                      onClick={() => handleActionClick(msg.action)}
                      className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 ${
                        isDark
                          ? 'bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#F3F1EC]'
                          : 'bg-[#9E824C] text-[#FFFFFF] hover:bg-[#866D3D]'
                      }`}
                    >
                      <span>{msg.action.label}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-[#6A6E7B] font-mono mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-[#D8C7A5] text-xs font-mono p-2">
            <span className="w-2 h-2 rounded-full bg-[#D8C7A5] animate-ping" />
            <span>Aja is formulating tailored creative guidance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div
        className={`px-3 py-2 border-t overflow-x-auto flex gap-1.5 no-scrollbar ${
          isDark ? 'bg-[#0e1014] border-[#1f2228]' : 'bg-[#FAF8F5] border-[#E8E4DC]'
        }`}
      >
        {quickPrompts.map((qp) => (
          <button
            key={qp}
            type="button"
            onClick={() => handleSend(qp)}
            className={`text-[10px] tracking-wide whitespace-nowrap px-2.5 py-1.5 border transition-colors ${
              isDark
                ? 'text-[#8E929A] hover:text-[#F3F1EC] bg-[#16181f] border-[#24272D] hover:border-[#D8C7A5]'
                : 'text-[#646A77] hover:text-[#14171A] bg-[#FFFFFF] border-[#DDD7CD] hover:border-[#A58B55]'
            }`}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div
        className={`p-3 border-t ${
          isDark ? 'bg-[#14161a] border-[#24272D]' : 'bg-[#FFFFFF] border-[#E5E0D6]'
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aja about packages, direction, turnaround..."
            className={`flex-1 text-xs px-3 py-2.5 border focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] placeholder-[#6E7380] focus:border-[#D8C7A5]'
                : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] placeholder-[#8E94A0] focus:border-[#A58B55]'
            }`}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-2.5 transition-colors disabled:opacity-40 ${
              isDark
                ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                : 'bg-[#9E824C] text-[#FFFFFF] hover:bg-[#866D3D]'
            }`}
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-inherit text-[10px] text-[#717682]">
          <span className="font-mono">ArkAja Concierge · AI Creative Direction</span>
          <button
            onClick={() => {
              onClose();
              onOpenBuilder();
            }}
            className="text-[#D8C7A5] hover:underline flex items-center gap-1 font-medium"
          >
            <span>Open Project Builder</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
