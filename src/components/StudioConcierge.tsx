import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Square,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import {
  getAjaSmartFallback,
  inferAjaSuggestions,
  type AjaAction,
  type AjaActionType,
} from '../data/ajaKnowledge';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  action?: AjaAction;
  followUps?: string[];
  isStreaming?: boolean;
}

interface StudioConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBuilder: () => void;
}

const STORAGE_KEY = 'arkaja_aja_chat_v2';

const DEFAULT_FOLLOW_UPS = [
  'Estimate Website + Logo + AI Chatbot',
  'Website (₹10k) vs Web App (₹15k)?',
  'My budget is ₹15,000',
  'Show Before & After Redesigns',
  'Turnaround & open slots',
];

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function createWelcomeMessage(): ChatMessage {
  return {
    id: 'init-1',
    role: 'model',
    text:
      "Hey — I'm **Aja**, ArkAja Studio's Senior Creative Advisor & Scope Architect.\n\n" +
      "Tell me what you're building, drop a wish-list like *\"website + logo + chatbot\"*, or share a budget for an instant estimate and bespoke art direction — or just chat!",
    timestamp: formatTime(),
    followUps: DEFAULT_FOLLOW_UPS,
  };
}

function loadSavedMessages(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [createWelcomeMessage()];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((m) => ({ ...m, isStreaming: false }));
    }
  } catch {
    // Ignore storage parse errors
  }
  return [createWelcomeMessage()];
}

function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('mailto:')
  );
}

/**
 * Safe, dependency-free inline markdown renderer supporting:
 * [label](url), **bold**, *italic*, and `inline code`.
 */
function renderInlineMarkdown(
  text: string,
  isUser: boolean,
  isDark: boolean
): React.ReactNode[] {
  const tokenRegex =
    /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      if (isSafeUrl(href)) {
        const isMail = href.trim().toLowerCase().startsWith('mailto:');
        return (
          <a
            key={idx}
            href={href}
            target={isMail ? undefined : '_blank'}
            rel={isMail ? undefined : 'noopener noreferrer'}
            className={`inline-flex items-center gap-0.5 underline underline-offset-2 font-medium transition-colors ${
              isUser
                ? 'text-inherit'
                : isDark
                ? 'text-[#D8C7A5] hover:text-[#FAF8F5]'
                : 'text-[#8C723E] hover:text-[#14171A]'
            }`}
          >
            <span>{label}</span>
            {!isMail && <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />}
          </a>
        );
      }
      return <span key={idx}>{label}</span>;
    }

    // **bold**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong
          key={idx}
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

    // *italic*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic opacity-95">
          {part.slice(1, -1)}
        </em>
      );
    }

    // `inline code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className={`px-1 py-0.5 font-mono text-[11px] ${
            isUser
              ? 'bg-black/15 text-inherit'
              : isDark
              ? 'bg-[#0e1015] text-[#D8C7A5] border border-[#2a2e38]'
              : 'bg-[#F0ECE4] text-[#5c4820] border border-[#DFD8CA]'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderMessageBody(
  text: string,
  isUser: boolean,
  isDark: boolean,
  isStreaming?: boolean
): React.ReactNode {
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-2">
      {blocks.map((block, bIdx) => {
        const lines = block.split('\n');
        const isLastBlock = bIdx === blocks.length - 1;

        return (
          <div key={bIdx} className="space-y-1">
            {lines.map((rawLine, lIdx) => {
              const trimmed = rawLine.trim();
              const isLastLine = isLastBlock && lIdx === lines.length - 1;
              const cursor = isStreaming && isLastLine ? (
                <span
                  aria-hidden="true"
                  className={`inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse ${
                    isDark ? 'bg-[#D8C7A5]' : 'bg-[#9E824C]'
                  }`}
                />
              ) : null;

              // Subheadings (### or ##)
              const headingMatch = trimmed.match(/^#{2,4}\s+(.*)$/);
              if (headingMatch) {
                return (
                  <p
                    key={lIdx}
                    className={`font-serif text-[13px] font-medium tracking-wide pt-1 ${
                      isUser
                        ? 'text-inherit'
                        : isDark
                        ? 'text-[#D8C7A5]'
                        : 'text-[#8C723E]'
                    }`}
                  >
                    {renderInlineMarkdown(headingMatch[1], isUser, isDark)}
                    {cursor}
                  </p>
                );
              }

              // Bullet list item (•, -, *)
              const bulletMatch = trimmed.match(/^(?:•|-|\*)\s+(.*)$/);
              if (bulletMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 leading-relaxed">
                    <span
                      className={`mt-1.5 w-1 h-1 shrink-0 ${
                        isUser
                          ? 'bg-current'
                          : isDark
                          ? 'bg-[#D8C7A5]'
                          : 'bg-[#9E824C]'
                      }`}
                    />
                    <span className="flex-1">
                      {renderInlineMarkdown(bulletMatch[1], isUser, isDark)}
                      {cursor}
                    </span>
                  </div>
                );
              }

              // Numbered list item (1., 2., ...)
              const numMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-1.5 pl-1 leading-relaxed">
                    <span
                      className={`font-mono text-[10px] mt-0.5 shrink-0 ${
                        isUser
                          ? 'text-inherit opacity-80'
                          : isDark
                          ? 'text-[#D8C7A5]'
                          : 'text-[#8C723E]'
                      }`}
                    >
                      {numMatch[1]}
                    </span>
                    <span className="flex-1">
                      {renderInlineMarkdown(numMatch[2], isUser, isDark)}
                      {cursor}
                    </span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="leading-relaxed">
                  {renderInlineMarkdown(rawLine, isUser, isDark)}
                  {cursor}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export const StudioConcierge: React.FC<StudioConciergeProps> = ({
  isOpen,
  onClose,
  onOpenBuilder,
}) => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadSavedMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist conversation in sessionStorage so closing/reopening stays ready
  useEffect(() => {
    try {
      const toStore = messages
        .filter((m) => m.text.trim().length > 0)
        .slice(-30)
        .map(({ isStreaming: _s, ...rest }) => rest);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Ignore storage quota errors
    }
  }, [messages]);

  // Smooth auto-scroll on updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Auto-focus input when opened so Aja is instantly ready
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Abort active stream on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  }, []);

  const handleResetChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setInput('');
    const welcome = createWelcomeMessage();
    setMessages([welcome]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setTimeout(() => inputRef.current?.focus(), 40);
  }, []);

  const handleCopyMessage = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1800);
    } catch {
      // Clipboard API unavailable in restricted iframe
    }
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText ?? input).trim();
    if (!textToSend || isLoading) return;

    const now = formatTime();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: now,
    };

    const modelMsgId = `aja-${Date.now() + 1}`;
    const placeholderModelMessage: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: now,
      isStreaming: true,
    };

    const historyPayload = messages
      .filter((m) => m.text.trim().length > 0)
      .slice(-12)
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMessage, placeholderModelMessage]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    let streamedText = '';
    let resolvedAction: AjaAction | undefined;
    let resolvedFollowUps: string[] | undefined;

    try {
      // 1. Primary path: Real-time SSE token streaming (/api/chat/stream)
      const streamRes = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      if (!streamRes.ok || !streamRes.body) {
        throw new Error(`Stream endpoint returned ${streamRes.status}`);
      }

      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const rawEvent of events) {
          const dataLines = rawEvent
            .split('\n')
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trim());

          if (dataLines.length === 0) continue;

          try {
            const payload = JSON.parse(dataLines.join('\n'));
            if (payload.type === 'chunk' && typeof payload.text === 'string') {
              streamedText += payload.text;
              const currentSnapshot = streamedText;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === modelMsgId
                    ? { ...m, text: currentSnapshot, isStreaming: true }
                    : m
                )
              );
            } else if (payload.type === 'done') {
              if (payload.action) resolvedAction = payload.action;
              if (Array.isArray(payload.followUps)) {
                resolvedFollowUps = payload.followUps;
              }
            }
          } catch {
            // Skip malformed SSE frame
          }
        }
      }

      clearTimeout(timeoutId);

      if (!streamedText.trim()) {
        throw new Error('Empty stream response');
      }

      const finalSuggestions =
        resolvedFollowUps && resolvedFollowUps.length > 0
          ? { action: resolvedAction, followUps: resolvedFollowUps }
          : inferAjaSuggestions(textToSend, streamedText);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === modelMsgId
            ? {
                ...m,
                text: streamedText,
                timestamp: formatTime(),
                action: resolvedAction ?? finalSuggestions.action,
                followUps: finalSuggestions.followUps,
                isStreaming: false,
              }
            : m
        )
      );
    } catch (err: any) {
      clearTimeout(timeoutId);

      // If user manually clicked Stop and we already have partial text, keep it cleanly
      if (err?.name === 'AbortError' && streamedText.trim()) {
        const inferred = inferAjaSuggestions(textToSend, streamedText);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === modelMsgId
              ? {
                  ...m,
                  text: streamedText,
                  timestamp: formatTime(),
                  action: inferred.action,
                  followUps: inferred.followUps,
                  isStreaming: false,
                }
              : m
          )
        );
        return;
      }

      // 2. Secondary fallback: Standard JSON endpoint (/api/chat) -> Instant Smart Engine
      let finalReply = '';
      let finalAction: AjaAction | undefined;
      let finalFollowUps: string[] = DEFAULT_FOLLOW_UPS;

      try {
        if (err?.name !== 'AbortError') {
          const jsonRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: textToSend,
              history: historyPayload,
            }),
          });
          if (jsonRes.ok) {
            const data = await jsonRes.json();
            if (data?.reply) {
              finalReply = data.reply;
              finalAction = data.action;
              finalFollowUps = Array.isArray(data.followUps)
                ? data.followUps
                : inferAjaSuggestions(textToSend, data.reply).followUps;
            }
          }
        }
      } catch {
        // Proceed to local smart fallback
      }

      if (!finalReply) {
        const smart = getAjaSmartFallback(textToSend, historyPayload);
        finalReply = smart.reply;
        finalAction = smart.action;
        finalFollowUps = smart.followUps;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === modelMsgId
            ? {
                ...m,
                text: finalReply,
                timestamp: formatTime(),
                action: finalAction,
                followUps: finalFollowUps,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  };

  const handleActionClick = (action?: AjaAction) => {
    if (!action) return;
    onClose();

    const sectionMap: Record<AjaActionType, string> = {
      builder: 'builder',
      enquiry: 'enquire',
      pricing: 'pricing',
      work: 'work',
      services: 'services',
    };

    const targetId = sectionMap[action.type];
    const el = targetId ? document.getElementById(targetId) : null;

    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (action.type === 'builder') {
      onOpenBuilder();
    }
  };

  // Dynamic context-aware ready chips from Aja's most recent completed turn
  const activeFollowUps = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'model' && !m.isStreaming && m.followUps && m.followUps.length > 0) {
        return m.followUps;
      }
    }
    return DEFAULT_FOLLOW_UPS;
  })();

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[448px] max-h-[85vh] h-[680px] flex flex-col border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 transition-colors ${
        isDark
          ? 'bg-[#111317] border-[#2E333B] text-[#F3F1EC]'
          : 'bg-[#FFFFFF] border-[#DDD7CD] text-[#14171A]'
      }`}
      role="dialog"
      aria-label="Aja ArkAja Studio Advisor"
    >
      {/* Header */}
      <div
        className={`px-4 py-3.5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#14171d] border-[#24272D]' : 'bg-[#FAF8F5] border-[#E5E0D6]'
        }`}
      >
        <div className="flex items-center gap-3">
          <Logo variant="full" size="sm" />
          <div className="h-5 w-[1px] bg-current opacity-20" />
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-medium tracking-wide">
              Aja
            </span>
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

        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleResetChat}
              title="New conversation"
              aria-label="Start new conversation"
              className={`p-1.5 transition-colors ${
                isDark
                  ? 'text-[#8E929A] hover:text-[#D8C7A5]'
                  : 'text-[#7B818F] hover:text-[#8C723E]'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 transition-colors ${
              isDark
                ? 'text-[#8E929A] hover:text-[#F3F1EC]'
                : 'text-[#7B818F] hover:text-[#14171A]'
            }`}
            aria-label="Close Advisor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-light">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isWaitingFirstToken = msg.isStreaming && !msg.text;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] p-3.5 leading-relaxed rounded-none ${
                  isUser
                    ? isDark
                      ? 'bg-[#F3F1EC] text-[#0b0c0e] font-normal shadow-sm'
                      : 'bg-[#9E824C] text-[#FFFFFF] font-normal shadow-sm'
                    : isDark
                    ? 'bg-[#181b22] text-[#E5E2D9] border border-[#24272D]'
                    : 'bg-[#F9F7F3] text-[#2C3038] border border-[#E5E0D6]'
                }`}
              >
                {isWaitingFirstToken ? (
                  <div className="flex items-center gap-2 text-[#D8C7A5] text-[11px] font-mono py-0.5">
                    <span className="w-1.5 h-1.5 bg-[#D8C7A5] animate-ping" />
                    <span>Aja is thinking...</span>
                  </div>
                ) : (
                  renderMessageBody(msg.text, isUser, isDark, msg.isStreaming)
                )}

                {/* Deep-link Action Button */}
                {!msg.isStreaming && msg.action && (
                  <div
                    className={`mt-3 pt-2.5 border-t ${
                      isDark ? 'border-[#262a33]' : 'border-[#E5E0D6]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleActionClick(msg.action)}
                      className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 ${
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

              {/* Timestamp + Copy Action */}
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[9px] text-[#6A6E7B] font-mono">
                  {msg.timestamp}
                </span>
                {!isUser && !msg.isStreaming && msg.text && msg.id !== 'init-1' && (
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    aria-label="Copy response"
                    className={`inline-flex items-center gap-1 text-[9px] font-mono transition-colors ${
                      copiedId === msg.id
                        ? isDark
                          ? 'text-[#D8C7A5]'
                          : 'text-[#8C723E]'
                        : 'text-[#6A6E7B] hover:text-current'
                    }`}
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-2.5 h-2.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Ready Suggestions Bar */}
      <div
        className={`px-3 py-2 border-t overflow-x-auto flex gap-1.5 no-scrollbar ${
          isDark ? 'bg-[#0e1014] border-[#1f2228]' : 'bg-[#FAF8F5] border-[#E8E4DC]'
        }`}
      >
        {activeFollowUps.map((qp) => (
          <button
            key={qp}
            type="button"
            disabled={isLoading}
            onClick={() => handleSend(qp)}
            className={`text-[10px] tracking-wide whitespace-nowrap px-2.5 py-1.5 border transition-colors disabled:opacity-45 ${
              isDark
                ? 'text-[#B5B9C2] hover:text-[#F3F1EC] bg-[#16181f] border-[#262a33] hover:border-[#D8C7A5]'
                : 'text-[#5A606D] hover:text-[#14171A] bg-[#FFFFFF] border-[#DDD7CD] hover:border-[#A58B55]'
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
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aja for a quote, art direction, or package fit..."
            className={`flex-1 text-xs px-3 py-2.5 border focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#0b0c0e] border-[#24272D] text-[#F3F1EC] placeholder-[#6E7380] focus:border-[#D8C7A5]'
                : 'bg-[#FAF8F5] border-[#DDD7CD] text-[#14171A] placeholder-[#8E94A0] focus:border-[#A58B55]'
            }`}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={handleStopStreaming}
              className={`p-2.5 transition-colors ${
                isDark
                  ? 'bg-[#262a33] text-[#F3F1EC] hover:bg-[#353a46]'
                  : 'bg-[#E5E0D6] text-[#14171A] hover:bg-[#D5CEC2]'
              }`}
              aria-label="Stop response"
              title="Stop response"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className={`p-2.5 transition-colors disabled:opacity-40 ${
                isDark
                  ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                  : 'bg-[#9E824C] text-[#FFFFFF] hover:bg-[#866D3D]'
              }`}
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-inherit text-[10px] text-[#717682]">
          <span className="font-mono">ArkAja Concierge · Instant Estimates &amp; Direction</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBuilder();
            }}
            className={`hover:underline flex items-center gap-1 font-medium ${
              isDark ? 'text-[#D8C7A5]' : 'text-[#8C723E]'
            }`}
          >
            <span>Open Scope Builder</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
