import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { X, LogOut, FileText, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface ClientAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBuilder: () => void;
  onOpenEnquiry: () => void;
}

export const ClientAccountModal: React.FC<ClientAccountModalProps> = ({
  isOpen,
  onClose,
  onOpenBuilder,
  onOpenEnquiry,
}) => {
  const { user, signOut, userEnquiries, userDrafts } = useAuth();
  const { isDark } = useTheme();

  // Escape key listener to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border transition-colors ${
          isDark
            ? 'bg-[#121418] border-[#24272D] text-[#F3F1EC]'
            : 'bg-[#FFFFFF] border-[#E2DDD5] text-[#14171A]'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 transition-colors ${
            isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7A808C] hover:text-[#14171A]'
          }`}
          aria-label="Close Account Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with User Info */}
        <div className="flex items-center gap-4 pb-6 border-b border-inherit mb-6">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Client'}
              className="w-14 h-14 rounded-full border-2 border-[#D8C7A5] object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#D8C7A5] text-[#0b0c0e] font-serif text-2xl flex items-center justify-center font-bold">
              {(user.displayName || user.email || 'A')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Logo variant="full" size="sm" />
              <span className="opacity-30">|</span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono">
                CLIENT PORTAL
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <h3 className="font-serif text-2xl font-normal mt-0.5">
              {user.displayName || 'Valued Client'}
            </h3>
            <p className="text-xs text-[#8E929A] font-mono">{user.email}</p>
          </div>
          <button
            onClick={() => {
              signOut();
              onClose();
            }}
            className={`ml-auto px-3 py-1.5 text-xs tracking-wider uppercase border flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'border-[#2E333D] text-[#8E929A] hover:text-[#F3F1EC] hover:border-[#4B5261]'
                : 'border-[#D4CEBF] text-[#6B7280] hover:text-[#14171A] hover:border-[#14171A]'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tabs / Submissions stored in Firestore */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Submitted Enquiries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-[#D8C7A5]">
                Submitted Briefs & Enquiries ({userEnquiries.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenEnquiry();
                }}
                className="text-[11px] underline text-[#D8C7A5] hover:opacity-80"
              >
                + New Brief
              </button>
            </div>

            {userEnquiries.length === 0 ? (
              <div
                className={`p-6 text-center border border-dashed rounded text-xs ${
                  isDark
                    ? 'border-[#262B34] text-[#717784] bg-[#14171D]'
                    : 'border-[#E2DDD5] text-[#828896] bg-[#FAF8F5]'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2 opacity-50 text-[#D8C7A5]" />
                <p>No project enquiries submitted under this account yet.</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenEnquiry();
                  }}
                  className="mt-3 text-xs tracking-widest uppercase font-medium text-[#D8C7A5] hover:underline"
                >
                  Start Your First Project Brief
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userEnquiries.map((enq, idx) => (
                  <div
                    key={enq.enquiryId || idx}
                    className={`p-4 border transition-all ${
                      isDark
                        ? 'bg-[#15181F] border-[#252A35]'
                        : 'bg-[#F9F7F3] border-[#E5E0D6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs text-[#D8C7A5] font-semibold">
                        {enq.enquiryId || `REF-${idx}`}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {enq.status || 'Received'}
                      </span>
                    </div>
                    <div className="font-serif text-lg font-medium">
                      {enq.brandName || 'Untitled Brand'}
                    </div>
                    <p className="text-xs text-[#8E929A] mt-1 line-clamp-2">
                      {enq.projectDetails}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-inherit text-[11px] text-[#8E929A] font-mono">
                      <span>Pkg: {enq.preferredPackage || 'Custom'}</span>
                      <span>·</span>
                      <span>Timeline: {enq.timeline || 'Flexible'}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Drafts */}
          {userDrafts.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-[#D8C7A5] mb-3">
                Saved Scope Drafts ({userDrafts.length})
              </h4>
              <div className="space-y-2">
                {userDrafts.map((d, i) => (
                  <div
                    key={d.draftId || i}
                    className={`p-3.5 border flex items-center justify-between ${
                      isDark ? 'bg-[#15181F] border-[#252A35]' : 'bg-[#F9F7F3] border-[#E5E0D6]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium font-serif">
                        {d.brandName || 'Custom Scope Draft'}
                      </div>
                      <div className="text-xs text-[#8E929A] font-mono mt-0.5">
                        Category: {d.category || 'General'} · Budget: {d.budget || 'Custom'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBuilder();
                      }}
                      className="px-3 py-1.5 text-xs text-[#D8C7A5] hover:text-[#F3F1EC] border border-[#D8C7A5]/50 hover:border-[#D8C7A5] tracking-wider uppercase font-medium"
                    >
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-inherit flex items-center justify-between">
          <span className="text-[11px] text-[#717784] font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D8C7A5]" />
            Firestore Cloud Synced
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenBuilder();
            }}
            className="px-5 py-2.5 bg-[#D8C7A5] text-[#0b0c0e] hover:bg-[#F3F1EC] text-xs uppercase font-medium tracking-[0.16em] transition-colors"
          >
            Build New Project
          </button>
        </div>
      </div>
    </div>
  );
};
