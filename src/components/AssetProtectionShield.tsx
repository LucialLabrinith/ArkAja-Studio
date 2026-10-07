import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheck, ShieldAlert, Lock, Smartphone, Monitor } from 'lucide-react';

export const AssetProtectionShield: React.FC = () => {
  const { isDark } = useTheme();
  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shieldTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restoreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const deactivateScreenshotProtection = useCallback(() => {
    document.documentElement.classList.remove('screenshot-blanked');
    document.body.classList.remove('screenshot-blanked');
    setIsScreenshotBlocked(false);
  }, []);

  const activateScreenshotProtection = useCallback(() => {
    if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);

    // 1. Immediately & synchronously blank the entire DOM so system capture buffer captures black
    document.documentElement.classList.add('screenshot-blanked');
    document.body.classList.add('screenshot-blanked');
    setIsScreenshotBlocked(true);

    // 2. Overwrite system clipboard to replace any captured image buffer with studio notice
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText('SCREENSHOT PREVENTION ACTIVATED — ArkAja Studio concepts and visual assets are copyright protected.')
        .catch(() => {});
    }

    // 3. Fallback auto-restore after 3.2 seconds
    if (shieldTimeoutRef.current) clearTimeout(shieldTimeoutRef.current);
    shieldTimeoutRef.current = setTimeout(() => {
      deactivateScreenshotProtection();
    }, 3200);
  }, [deactivateScreenshotProtection]);

  useEffect(() => {
    // ---------------------------------------------------------------
    // 1. MOBILE PHONES & TABLETS (iOS Safari, Android Chrome, etc.)
    // ---------------------------------------------------------------
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        activateScreenshotProtection();
      } else {
        // Keep blanked for 600ms so mobile OS screenshot buffer writes black
        if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
        restoreTimeoutRef.current = setTimeout(() => {
          deactivateScreenshotProtection();
        }, 600);
      }
    };

    const handlePageHide = () => {
      activateScreenshotProtection();
    };

    const handlePageShow = () => {
      if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
      restoreTimeoutRef.current = setTimeout(() => {
        deactivateScreenshotProtection();
      }, 500);
    };

    // Mobile multi-touch gesture detection: 3-finger swipe screenshot on Android / palm swipe
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 3) {
        // 3-finger swipe screenshot gesture detected
        activateScreenshotProtection();
        return;
      }

      const target = e.target as HTMLElement;
      const isProtected =
        target.tagName === 'IMG' ||
        target.tagName === 'PICTURE' ||
        target.tagName === 'CANVAS' ||
        target.closest('img') ||
        target.closest('[data-protected-asset]') ||
        target.closest('.aspect-\\[16\\/10\\]') ||
        target.closest('.aspect-\\[16\\/9\\]');

      if (isProtected) {
        if (touchTimer) clearTimeout(touchTimer);
        touchTimer = setTimeout(() => {
          if (navigator.vibrate) navigator.vibrate(40);
          showToast('ArkAja Studio · Artwork is copyright protected. Image saving is restricted.');
          target.style.filter = 'blur(10px)';
          setTimeout(() => {
            target.style.filter = '';
          }, 600);
        }, 280);
      }
    };

    let touchTimer: NodeJS.Timeout | null = null;
    const handleTouchEndOrCancel = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };

    // ---------------------------------------------------------------
    // 2. WINDOW BLUR & FOCUS (CROSS-OS: Phone, Windows, macOS, Linux)
    // ---------------------------------------------------------------
    const handleWindowBlur = () => {
      // Don't blank screen if user is interacting with an input, file picker, or payment modal
      const activeEl = document.activeElement;
      const isIframe = activeEl && activeEl.tagName === 'IFRAME';
      const isRazorpayActive = Boolean(
        document.querySelector('iframe[src*="razorpay"]') ||
        document.querySelector('.razorpay-container') ||
        document.querySelector('#razorpay-checkout-frame') ||
        document.querySelector('[data-payment-modal="true"]')
      );
      const isFileInputActive = activeEl && activeEl.tagName === 'INPUT' && (activeEl as HTMLInputElement).type === 'file';
      const isInteractiveForm = activeEl && (
        activeEl.tagName === 'SELECT' ||
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );

      if (isIframe || isRazorpayActive || isFileInputActive || isInteractiveForm) {
        return;
      }

      activateScreenshotProtection();
    };

    const handleWindowFocus = () => {
      if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
      restoreTimeoutRef.current = setTimeout(() => {
        deactivateScreenshotProtection();
      }, 400);
    };

    // ---------------------------------------------------------------
    // 3. KEYBOARD CAPTURE SHORTCUTS (Windows, macOS, Linux, ChromeOS)
    // ---------------------------------------------------------------
    const handleCaptureKeys = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode;
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (isInput && !e.metaKey && !e.ctrlKey) {
        return;
      }

      // Explicit PrintScreen Detection (Windows / Linux / ChromeOS)
      if (key === 'PrintScreen' || code === 'PrintScreen' || keyCode === 44 || key === 'Snapshot') {
        e.preventDefault();
        activateScreenshotProtection();
        return;
      }

      const isMac = typeof navigator !== 'undefined' && (navigator.platform?.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent?.indexOf('Mac') >= 0);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Print Preview / Print to PDF: Ctrl+P / Cmd+P
      if (cmdOrCtrl && (key === 'p' || key === 'P')) {
        e.preventDefault();
        activateScreenshotProtection();
        return;
      }

      // Save Webpage: Ctrl+S / Cmd+S
      if (cmdOrCtrl && (key === 's' || key === 'S')) {
        e.preventDefault();
        showToast('Saving webpage is disabled.');
        return;
      }

      // macOS Screen Capture Shortcuts: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5, Cmd+Ctrl+Shift+3/4
      if (
        (e.metaKey && e.shiftKey) &&
        (key === '3' || key === '4' || key === '5' || key === '$' || key === '#' || key === '%' || key === 's' || key === 'S')
      ) {
        e.preventDefault();
        activateScreenshotProtection();
        return;
      }

      // Windows Snipping Shortcut: Win+Shift+S / Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 's' || key === 'S')) {
        e.preventDefault();
        activateScreenshotProtection();
        return;
      }

      // DevTools Inspection Shortcut: Ctrl+Shift+I / Cmd+Option+I / F12
      if (
        (cmdOrCtrl && e.shiftKey && (key === 'i' || key === 'I' || key === 'c' || key === 'C' || key === 'j' || key === 'J')) ||
        key === 'F12'
      ) {
        showToast('ArkAja Studio · Developer inspection of assets is restricted.');
      }
    };

    // ---------------------------------------------------------------
    // 4. CONTEXT MENU & DRAG PREVENTION
    // ---------------------------------------------------------------
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isProtected =
        target.tagName === 'IMG' ||
        target.tagName === 'PICTURE' ||
        target.tagName === 'VIDEO' ||
        target.tagName === 'CANVAS' ||
        target.closest('img') ||
        target.closest('[data-protected-asset]') ||
        target.closest('.aspect-\\[16\\/10\\]') ||
        target.closest('.aspect-\\[16\\/9\\]');

      if (isProtected) {
        e.preventDefault();
        e.stopPropagation();
        showToast('ArkAja Studio · Artwork is copyright protected. Context menu is restricted.');
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img') || target.closest('[data-protected-asset]')) {
        e.preventDefault();
        e.stopPropagation();
        showToast('ArkAja Studio · Dragging visuals is disabled.');
      }
    };

    // ---------------------------------------------------------------
    // 5. COPY EVENT SANITIZATION
    // ---------------------------------------------------------------
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString();
      if (!selection) {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', 'SCREENSHOT PREVENTION ACTIVATED — ArkAja Studio concepts are copyright protected.');
        }
      }
    };

    // ---------------------------------------------------------------
    // 6. SCREEN RECORDING / DISPLAY MEDIA INTERCEPTION
    // ---------------------------------------------------------------
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const origGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getDisplayMedia = async function (constraints?: DisplayMediaStreamOptions) {
        activateScreenshotProtection();
        return origGetDisplayMedia(constraints);
      };
    }

    // Attach Listeners with capture phase
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleCaptureKeys, { capture: true });
    window.addEventListener('keyup', handleCaptureKeys, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('dragstart', handleDragStart, { capture: true });
    window.addEventListener('copy', handleCopy);

    // Mobile touch listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    window.addEventListener('touchend', handleTouchEndOrCancel, { passive: true, capture: true });
    window.addEventListener('touchcancel', handleTouchEndOrCancel, { passive: true, capture: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleCaptureKeys, { capture: true });
      window.removeEventListener('keyup', handleCaptureKeys, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('dragstart', handleDragStart, { capture: true });
      window.removeEventListener('copy', handleCopy);

      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchend', handleTouchEndOrCancel, { capture: true });
      window.removeEventListener('touchcancel', handleTouchEndOrCancel, { capture: true });

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (shieldTimeoutRef.current) clearTimeout(shieldTimeoutRef.current);
      if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
      if (touchTimer) clearTimeout(touchTimer);
    };
  }, [activateScreenshotProtection, deactivateScreenshotProtection, showToast]);

  // Render Portal element directly to body so it sits as a sibling to #root
  const overlayElement = typeof document !== 'undefined' ? (
    <div
      id="screenshot-shield-overlay"
      className={`fixed inset-0 z-[2147483647] bg-[#000000] text-white flex-col items-center justify-center p-6 text-center select-none cursor-default ${
        isScreenshotBlocked ? 'active-shield' : ''
      }`}
      style={{ backgroundColor: '#000000' }}
      role="alertdialog"
      aria-modal="true"
      onClick={() => deactivateScreenshotProtection()}
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

        <p className="font-sans text-sm sm:text-base text-stone-300 font-light leading-relaxed mb-6">
          Screen captures, recordings, and reproductions of ArkAja Studio proprietary concepts and artworks are restricted.
        </p>

        <div className="flex items-center justify-center gap-4 text-[10px] font-mono tracking-widest text-[#D8C7A5]/80 uppercase mb-8">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3 h-3" />
            <span>MOBILE SHIELD ACTIVE</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3 h-3" />
            <span>CROSS-OS SECURED</span>
          </span>
        </div>

        <div className="pt-4 border-t border-white/10 w-full flex items-center justify-between text-[10px] font-mono tracking-widest text-[#D8C7A5]/70 uppercase">
          <span>ARKAJA STUDIO</span>
          <span>ASSET PROTECTION ACTIVE</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deactivateScreenshotProtection();
          }}
          className="mt-8 px-6 py-2.5 text-[11px] font-medium tracking-[0.2em] uppercase bg-[#FAF8F5] text-[#000000] hover:bg-[#D8C7A5] transition-colors"
        >
          DISMISS
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* 1. PERSISTENT FLOATING STUDIO LOGO VISIBLE THROUGH ALL */}
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

        <div
          className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-[#A58B55] dark:text-[#D8C7A5] opacity-80 group-hover:opacity-100 transition-opacity"
          title="Studio Assets Protected • Screen Capture Prohibited across Mobile & Desktop"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#D8C7A5]" />
          <span className="hidden sm:inline">PROTECTED</span>
        </div>
      </aside>

      {/* 2. PROTECTIVE NOTIFICATION TOAST */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-3 duration-200 select-none pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-black/95 backdrop-blur-md border border-[#D8C7A5]/60 text-[#FAF8F5] shadow-2xl text-xs font-mono tracking-wide">
            <Lock className="w-3.5 h-3.5 text-[#D8C7A5] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 3. SOLID BLANK SCREEN MOUNTED VIA PORTAL DIRECTLY TO DOCUMENT.BODY */}
      {overlayElement && createPortal(overlayElement, document.body)}
    </>
  );
};
