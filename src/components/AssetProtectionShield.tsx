import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheck, ShieldAlert, Lock } from 'lucide-react';

export const AssetProtectionShield: React.FC = () => {
  const { isDark } = useTheme();
  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shieldTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCaptureKeyTimeRef = useRef<number>(0);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const triggerScreenshotPrevention = useCallback(() => {
    setIsScreenshotBlocked(true);

    // Overwrite system clipboard so pasted screenshot is replaced
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText('SCREENSHOT PREVENTION ACTIVATED — ArkAja Studio concepts are copyright protected.')
        .catch(() => {});
    }

    if (shieldTimeoutRef.current) clearTimeout(shieldTimeoutRef.current);
    // Keep blank screen active long enough to ensure any capture tool receives only the blank screen
    shieldTimeoutRef.current = setTimeout(() => {
      setIsScreenshotBlocked(false);
    }, 3200);
  }, []);

  useEffect(() => {
    // 1. Check for Screenshot Key Triggers on KeyDown AND KeyUp
    const handleCaptureKeys = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode;
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Do not treat normal typing in input/textarea as capture attempts
      if (isInput && !e.metaKey && !e.ctrlKey) {
        return;
      }

      // Track modifier keys that precede snipping tools
      if (
        key === 'PrintScreen' ||
        code === 'PrintScreen' ||
        keyCode === 44 ||
        ((e.metaKey || e.ctrlKey) && (e.shiftKey || key === 's' || key === 'S' || key === 'p' || key === 'P'))
      ) {
        lastCaptureKeyTimeRef.current = Date.now();
      }

      // Explicit PrintScreen Detection (Windows / Linux)
      if (key === 'PrintScreen' || code === 'PrintScreen' || keyCode === 44 || key === 'Snapshot') {
        e.preventDefault();
        triggerScreenshotPrevention();
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Print Preview / Print to PDF: Ctrl+P / Cmd+P
      if (cmdOrCtrl && (key === 'p' || key === 'P')) {
        e.preventDefault();
        triggerScreenshotPrevention();
        return;
      }

      // Save Webpage: Ctrl+S / Cmd+S
      if (cmdOrCtrl && (key === 's' || key === 'S')) {
        e.preventDefault();
        showToast('Saving webpage is disabled.');
        return;
      }

      // macOS Screen Capture Shortcuts: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5' || key === '$' || key === '#' || key === '%')) {
        e.preventDefault();
        triggerScreenshotPrevention();
        return;
      }

      // Windows Snipping Shortcut: Win+Shift+S / Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 's' || key === 'S')) {
        e.preventDefault();
        triggerScreenshotPrevention();
        return;
      }
    };

    // 2. Intelligent Blur Detection specifically for Screenshot / Snipping Tools
    // When Win+Shift+S or Cmd+Shift+4 or Snipping Tool activates, the window loses focus
    // right after Shift / Meta / S / PrintScreen was pressed.
    const handleWindowBlur = () => {
      const timeSinceCaptureKey = Date.now() - lastCaptureKeyTimeRef.current;
      // If window blurs within 2000ms of screenshot keys, it is an active capture tool
      if (timeSinceCaptureKey < 2000 && lastCaptureKeyTimeRef.current > 0) {
        setIsScreenshotBlocked(true);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText('SCREENSHOT PREVENTION ACTIVATED — ArkAja Studio concepts are copyright protected.')
            .catch(() => {});
        }
      }
    };

    const handleWindowFocus = () => {
      // When user returns to window, smoothly dismiss the blank screen
      if (shieldTimeoutRef.current) clearTimeout(shieldTimeoutRef.current);
      shieldTimeoutRef.current = setTimeout(() => {
        setIsScreenshotBlocked(false);
      }, 700);
    };

    // 3. Right-Click Context Menu Protection on Images
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'PICTURE' ||
        target.tagName === 'VIDEO' ||
        target.tagName === 'CANVAS' ||
        target.closest('img') ||
        target.closest('[data-protected-asset]') ||
        target.closest('.aspect-\\[16\\/10\\]') ||
        target.closest('.aspect-\\[16\\/9\\]')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showToast('ArkAja Studio · Concept artwork is copyright protected. Copying is restricted.');
      }
    };

    // 4. Drag Start Prevention on Images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img') || target.closest('[data-protected-asset]')) {
        e.preventDefault();
        e.stopPropagation();
        showToast('ArkAja Studio · Dragging visuals is disabled.');
      }
    };

    // 5. Copy Event Sanitization
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString();
      if (!selection) {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', 'SCREENSHOT PREVENTION ACTIVATED — ArkAja Studio.');
        }
      }
    };

    window.addEventListener('keydown', handleCaptureKeys, { capture: true });
    window.addEventListener('keyup', handleCaptureKeys, { capture: true });
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('dragstart', handleDragStart, { capture: true });
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleCaptureKeys, { capture: true });
      window.removeEventListener('keyup', handleCaptureKeys, { capture: true });
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('dragstart', handleDragStart, { capture: true });
      window.removeEventListener('copy', handleCopy);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (shieldTimeoutRef.current) clearTimeout(shieldTimeoutRef.current);
    };
  }, [triggerScreenshotPrevention, showToast]);

  return (
    <>
      {/* ======================================================== */}
      {/* 1. PERSISTENT FLOATING STUDIO LOGO VISIBLE THROUGH ALL   */}
      {/* ======================================================== */}
      <aside
        aria-label="ArkAja Studio Atelier Crest"
        className={`fixed bottom-5 left-5 z-40 select-none transition-all duration-300 pointer-events-auto shadow-2xl ${
          isDark
            ? 'bg-[#121418]/90 hover:bg-[#181B22] border-[#2A2E37] text-[#FAF8F5]'
            : 'bg-[#FFFFFF]/95 hover:bg-[#FAF7F2] border-[#E5DECF] text-[#14171A]'
        } border backdrop-blur-md px-3.5 py-2 flex items-center gap-3 group`}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 focus:outline-none"
          title="ArkAja Studio - Scroll to top"
        >
          <Logo variant="full" size="sm" />
        </a>

        <div className="h-4 w-[1px] bg-inherit opacity-30" />

        {/* Studio Protection Indicator */}
        <div
          className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-[#A58B55] dark:text-[#D8C7A5] opacity-80 group-hover:opacity-100 transition-opacity"
          title="Studio Assets Protected • Screen Capture Prohibited"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#D8C7A5]" />
          <span className="hidden sm:inline">PROTECTED</span>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. PROTECTIVE NOTIFICATION TOAST                         */}
      {/* ======================================================== */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-60 animate-in fade-in slide-in-from-top-3 duration-200 select-none pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-black/95 backdrop-blur-md border border-[#D8C7A5]/60 text-[#FAF8F5] shadow-2xl text-xs font-mono tracking-wide">
            <Lock className="w-3.5 h-3.5 text-[#D8C7A5] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SOLID BLANK SCREEN FOR SCREENSHOT PREVENTION          */}
      {/* (Captures in the screenshot image will result in a blank */}
      {/* screen with the message 'SCREENSHOT PREVENTION ACTIVATED')*/}
      {/* ======================================================== */}
      {isScreenshotBlocked && (
        <div
          id="screenshot-shield-overlay"
          className="fixed inset-0 z-[99999999] bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center select-none cursor-default"
          style={{ backgroundColor: '#000000' }}
          role="alertdialog"
          aria-modal="true"
        >
          <div className="flex flex-col items-center justify-center max-w-lg w-full p-8 text-center animate-in fade-in duration-100">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-full border-2 border-[#D8C7A5] flex items-center justify-center mb-6 text-[#D8C7A5] bg-[#000000]">
              <ShieldAlert className="w-8 h-8" />
            </div>

            {/* Clear, Prominent Message */}
            <h1 className="font-mono text-2xl sm:text-4xl text-[#D8C7A5] font-bold tracking-[0.2em] uppercase mb-4 leading-tight">
              SCREENSHOT PREVENTION ACTIVATED
            </h1>

            <p className="font-sans text-sm sm:text-base text-stone-300 font-light leading-relaxed mb-8">
              Screen captures, recordings, and reproductions of ArkAja Studio proprietary concepts and artworks are restricted.
            </p>

            <div className="pt-4 border-t border-white/10 w-full flex items-center justify-between text-[10px] font-mono tracking-widest text-[#D8C7A5]/70 uppercase">
              <span>ARKAJA STUDIO</span>
              <span>ASSET PROTECTION ACTIVE</span>
            </div>

            <button
              onClick={() => setIsScreenshotBlocked(false)}
              className="mt-8 px-6 py-2.5 text-[11px] font-medium tracking-[0.2em] uppercase bg-[#FAF8F5] text-[#000000] hover:bg-[#D8C7A5] transition-colors"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}
    </>
  );
};
