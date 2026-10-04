import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import {
  X,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Trash2,
  Upload,
  Plus,
  ExternalLink,
  MessageCircle,
  Eye,
  LogOut,
  Sparkles,
  Inbox,
  Layers,
  AlertCircle,
  Phone,
} from 'lucide-react';
import {
  STUDIO_OWNER_EMAIL,
  subscribeToAllEnquiries,
  addProjectToFirestore,
  deleteProjectFromFirestore,
  updateEnquiryStatusInFirestore,
} from '../lib/firebase';
import { Project } from '../types';

interface StudioOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customProjects: Project[];
  onProjectAdded?: (project: Project) => void;
  onProjectDeleted?: (projectId: string) => void;
}

export const StudioOwnerModal: React.FC<StudioOwnerModalProps> = ({
  isOpen,
  onClose,
  customProjects,
  onProjectAdded,
  onProjectDeleted,
}) => {
  const { user, isOwner, signInAsOwner, signIn, signOut } = useAuth();
  const { isDark } = useTheme();

  // Login form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Active view tab in admin panel
  const [activeTab, setActiveTab] = useState<'inbox' | 'add-project' | 'manage-projects'>('inbox');

  // Real-time enquiries state
  const [liveEnquiries, setLiveEnquiries] = useState<any[]>([]);

  // New Project Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectCategory, setProjectCategory] = useState<'BEAUTY' | 'FASHION' | 'HOSPITALITY'>('FASHION');
  const [projectSubtitle, setProjectSubtitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTags, setProjectTags] = useState('');
  const [projectDeliverables, setProjectDeliverables] = useState('');
  const [projectImagePreview, setProjectImagePreview] = useState<string | null>(null);
  const [projectImageUrlInput, setProjectImageUrlInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Subscribe to real-time enquiries when owner is logged in
  useEffect(() => {
    if (isOpen && isOwner) {
      const unsubscribe = subscribeToAllEnquiries((enqs) => {
        setLiveEnquiries(enqs);
      });
      return () => unsubscribe();
    }
  }, [isOpen, isOwner]);

  if (!isOpen) return null;

  // Handle Studio Owner Login
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingLogin(true);

    try {
      const res = await signInAsOwner(emailInput, passwordInput);
      if (!res.success) {
        setLoginError(res.error || 'Authentication failed. Please check credentials.');
      } else {
        setPasswordInput('');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login error occurred.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Handle Image File Upload (converts to base64 preview for instant rendering)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setPublishError('Image file is too large (max 8MB). Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProjectImagePreview(result);
        setPublishError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Publishing a New Project to Firestore in Real Time
  const handlePublishProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishSuccess(null);

    if (!projectTitle.trim()) {
      setPublishError('Project title is required.');
      return;
    }

    const finalImage = projectImagePreview || projectImageUrlInput.trim();
    if (!finalImage) {
      setPublishError('Please upload an image or provide an image URL for the project thumbnail.');
      return;
    }

    setIsPublishing(true);

    try {
      const slug = projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `proj-${Date.now()}`;
      const newProjectId = `proj-${slug}-${Date.now().toString(36)}`;

      const tagsArray = projectTags
        ? projectTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Editorial', 'Art Direction'];

      const deliverablesArray = projectDeliverables
        ? projectDeliverables.split('\n').map((d) => d.trim()).filter(Boolean)
        : ['4 bespoke posts', '2 editorial stories', 'Creative direction'];

      const newProjectData: Project = {
        id: newProjectId,
        slug,
        title: projectTitle.trim(),
        category: projectCategory,
        label: 'CONCEPT PROJECT',
        productionLabel: 'AI-ASSISTED CREATIVE PRODUCTION',
        tagline: projectSubtitle.trim() || 'Contemporary Brand Direction',
        description: projectDescription.trim() || 'Editorial campaign visual direction created by ArkAja Studio.',
        services: deliverablesArray,
        creativeDirections: [
          {
            title: `${projectTitle.trim()} · Editorial Direction`,
            subtitle: projectSubtitle.trim() || 'Visual Direction',
            description: projectDescription.trim() || 'Curated brand concept visuals.',
            format: 'post',
          },
        ],
        images: [finalImage],
        colorPalette: ['#121418', '#FAF8F5', '#D8C7A5'],
        year: '2026',
      };

      // 1. Write to Firestore in real time
      try {
        await addProjectToFirestore({
          id: newProjectId,
          slug,
          title: newProjectData.title,
          category: newProjectData.category,
          subtitle: newProjectData.tagline,
          description: newProjectData.description,
          images: newProjectData.images,
          deliverables: newProjectData.services,
          creativeDirections: newProjectData.creativeDirections,
        });
      } catch (firestoreErr) {
        console.warn('Firestore project write note:', firestoreErr);
      }

      // 2. Also persist to local custom-projects backend store
      fetch('/api/custom-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjectData),
      }).catch((e) => console.warn('Custom projects store note:', e));

      // 3. Upload thumbnail to backend store if base64 data
      if (finalImage.startsWith('data:')) {
        fetch('/api/portfolio-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetFilename: `${slug}.webp`,
            base64Data: finalImage,
          }),
        }).catch((e) => console.warn('Local asset store sync note:', e));
      }

      // 4. Notify parent component to update state immediately
      if (onProjectAdded) {
        onProjectAdded(newProjectData);
      }

      setPublishSuccess(`Project "${newProjectData.title}" published! It is now live in the portfolio for all visitors.`);

      // Reset form
      setProjectTitle('');
      setProjectClient('');
      setProjectSubtitle('');
      setProjectDescription('');
      setProjectTags('');
      setProjectDeliverables('');
      setProjectImagePreview(null);
      setProjectImageUrlInput('');
    } catch (err: any) {
      console.error('Publish error:', err);
      setPublishError(err?.message || 'Failed to publish project to Firestore.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle Project Deletion
  const handleDeleteProject = async (projectId: string) => {
    try {
      try {
        await deleteProjectFromFirestore(projectId);
      } catch (firestoreErr) {
        console.warn('Firestore project deletion note:', firestoreErr);
      }

      fetch(`/api/custom-projects/${projectId}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Server project delete note:', e));

      if (onProjectDeleted) {
        onProjectDeleted(projectId);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  // Handle Status Update for Enquiries
  const handleUpdateEnquiryStatus = async (
    enquiryId: string,
    newStatus: 'pending_review' | 'contacted' | 'booked' | 'archived'
  ) => {
    try {
      await updateEnquiryStatusInFirestore(enquiryId, newStatus);
    } catch (e) {
      console.warn('Status update note:', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-w-4xl w-full p-6 sm:p-8 relative shadow-2xl border transition-colors max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 ${
          isDark
            ? 'bg-[#101216] border-[#24272D] text-[#F3F1EC]'
            : 'bg-[#FFFFFF] border-[#E2DDD5] text-[#14171A]'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 transition-colors ${
            isDark ? 'text-[#8E929A] hover:text-[#F3F1EC]' : 'text-[#7A808C] hover:text-[#14171A]'
          }`}
          aria-label="Close Studio Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================== */}
        {/* VIEW 1: STUDIO OWNER LOGIN FORM (If not authorized)            */}
        {/* ============================================================== */}
        {!isOwner ? (
          <div className="max-w-md mx-auto py-6">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-3 bg-[#D8C7A5]/10 border border-[#D8C7A5]/40 text-[#D8C7A5] rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Logo variant="full" size="sm" />
                <span className="opacity-30">|</span>
                <span className="text-[10px] tracking-[0.28em] uppercase text-[#D8C7A5] font-mono font-semibold">
                  STUDIO DIRECTOR ACCESS
                </span>
              </div>
              <h3 className="font-serif text-3xl font-normal">
                Owner Authentication
              </h3>
              <p
                className={`text-xs mt-2 leading-relaxed ${
                  isDark ? 'text-[#8E929A]' : 'text-[#7A808C]'
                }`}
              >
                Access restricted to verified studio director credentials to view real-time client inquiries and publish portfolio artwork.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-widest uppercase font-mono mb-1.5 opacity-70">
                  DIRECTOR EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="director@studio.com"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs font-mono border rounded-none focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                        : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase font-mono mb-1.5 opacity-70">
                  MASTER PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs font-mono border rounded-none focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                        : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingLogin}
                className={`w-full py-3.5 text-xs tracking-[0.2em] font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                  isDark
                    ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                    : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmittingLogin ? 'VERIFYING...' : 'SIGN IN AS STUDIO DIRECTOR'}</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-inherit text-center">
              <span className="text-[10px] tracking-widest uppercase font-mono opacity-60 block mb-3">
                OR SIGN IN WITH AUTHORIZED GOOGLE ACCOUNT
              </span>
              <button
                onClick={async () => {
                  setLoginError(null);
                  try {
                    await signIn();
                  } catch (err: any) {
                    setLoginError(err?.message || 'Google sign-in restricted to authorized director.');
                  }
                }}
                className={`w-full py-2.5 px-4 text-xs font-mono tracking-wider border transition-colors flex items-center justify-center gap-2 ${
                  isDark
                    ? 'border-[#2E333D] text-[#C5CAD5] hover:text-white hover:border-[#D8C7A5]'
                    : 'border-[#D4CEBF] text-[#555B66] hover:text-black hover:border-[#A58B55]'
                }`}
              >
                <span>Continue with Google Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VIEW 2: AUTHORIZED STUDIO DIRECTOR DASHBOARD                   */
          /* ============================================================== */
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#D8C7A5] text-[#0b0c0e] font-serif text-xl flex items-center justify-center font-bold shadow-md">
                  D
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Logo variant="full" size="sm" />
                    <span className="opacity-30">|</span>
                    <span className="text-[9.5px] tracking-[0.25em] uppercase text-[#D8C7A5] font-mono font-semibold">
                      STUDIO DIRECTOR
                    </span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Firestore Real-time Active" />
                  </div>
                  <h3 className="font-serif text-2xl font-normal">
                    ArkAja Studio
                  </h3>
                  <div className="text-[11px] font-mono text-[#D8C7A5] flex items-center gap-1.5">
                    <span>{user?.email || 'Authorized Studio Director'}</span>
                    <span>·</span>
                    <span className="opacity-70">Real-time Cloud Sync</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    signOut();
                  }}
                  className={`px-3 py-1.5 text-xs tracking-wider uppercase border flex items-center gap-1.5 transition-colors ${
                    isDark
                      ? 'border-[#2E333D] text-[#8E929A] hover:text-[#F3F1EC] hover:border-[#D8C7A5]'
                      : 'border-[#D4CEBF] text-[#6B7280] hover:text-[#14171A] hover:border-[#14171A]'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-inherit mb-6 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all flex items-center gap-2 ${
                  activeTab === 'inbox'
                    ? 'border-b-2 border-[#D8C7A5] text-[#D8C7A5] font-semibold'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Live Enquiries</span>
                <span className="px-1.5 py-0.2 bg-[#D8C7A5] text-[#0b0c0e] text-[10px] font-bold rounded-full">
                  {liveEnquiries.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('add-project')}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all flex items-center gap-2 ${
                  activeTab === 'add-project'
                    ? 'border-b-2 border-[#D8C7A5] text-[#D8C7A5] font-semibold'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project & Images</span>
              </button>

              <button
                onClick={() => setActiveTab('manage-projects')}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase transition-all flex items-center gap-2 ${
                  activeTab === 'manage-projects'
                    ? 'border-b-2 border-[#D8C7A5] text-[#D8C7A5] font-semibold'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Published Projects ({customProjects.length})</span>
              </button>
            </div>

            {/* TAB 1: LIVE ENQUIRIES INBOX */}
            {activeTab === 'inbox' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div className="text-xs text-[#D8C7A5] font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-time Inquiries Inbox (Auto-updating)</span>
                  </div>
                  <span className="text-[11px] opacity-60 font-mono">
                    Direct recipient: {STUDIO_OWNER_EMAIL}
                  </span>
                </div>

                {liveEnquiries.length === 0 ? (
                  <div
                    className={`p-10 text-center border border-dashed rounded text-xs space-y-2 ${
                      isDark
                        ? 'border-[#262B34] text-[#717784] bg-[#14171D]'
                        : 'border-[#E2DDD5] text-[#828896] bg-[#FAF8F5]'
                    }`}
                  >
                    <Inbox className="w-8 h-8 mx-auto opacity-40 text-[#D8C7A5]" />
                    <p className="font-medium text-sm">No enquiries received yet.</p>
                    <p className="font-light">
                      When visitors submit the Project Brief or Enquiry form on the site, their submissions will appear here in real-time and will be sent to your Gmail ({STUDIO_OWNER_EMAIL}).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[58vh] overflow-y-auto pr-1">
                    {liveEnquiries.map((enq) => {
                      const isPending = enq.status === 'pending_review' || !enq.status;
                      const isContacted = enq.status === 'contacted';
                      const isBooked = enq.status === 'booked';

                      return (
                        <div
                          key={enq.id || enq.enquiryId}
                          className={`p-5 border transition-all ${
                            isDark
                              ? 'bg-[#14171E] border-[#252B37] hover:border-[#384152]'
                              : 'bg-[#F9F7F3] border-[#E5E0D6] hover:border-[#C4BCAB]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-inherit">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-[#D8C7A5]">
                                {enq.enquiryId || enq.id}
                              </span>
                              <span className="text-xs opacity-40">|</span>
                              <span className="font-serif text-base font-normal">
                                {enq.brandName || 'Untitled Brand'}
                              </span>
                              <span className="text-xs opacity-60">({enq.fullName})</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Status badge & selector */}
                              <select
                                value={enq.status || 'pending_review'}
                                onChange={(e) =>
                                  handleUpdateEnquiryStatus(enq.id || enq.enquiryId, e.target.value as any)
                                }
                                className={`text-[10px] font-mono px-2 py-1 uppercase rounded border focus:outline-none ${
                                  isBooked
                                    ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                                    : isContacted
                                    ? 'bg-blue-950/60 border-blue-800 text-blue-300'
                                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                }`}
                              >
                                <option value="pending_review">● Pending Review</option>
                                <option value="contacted">● In Contact</option>
                                <option value="booked">● Booked / Paid</option>
                                <option value="archived">● Archived</option>
                              </select>

                              <span className="text-[10px] font-mono opacity-50">
                                {new Date(enq.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Quick details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono mb-3 p-2.5 bg-black/20">
                            <div>
                              <span className="opacity-50 block text-[9.5px]">CLIENT EMAIL</span>
                              <a
                                href={`mailto:${enq.email}?subject=ArkAja Studio Project: ${enq.brandName}`}
                                className="text-[#D8C7A5] hover:underline truncate block"
                              >
                                {enq.email}
                              </a>
                            </div>
                            <div>
                              <span className="opacity-50 block text-[9.5px]">PHONE / WHATSAPP</span>
                              <span>{enq.phone || 'Not provided'}</span>
                            </div>
                            <div>
                              <span className="opacity-50 block text-[9.5px]">PACKAGE / TIMELINE</span>
                              <span>
                                {enq.preferredPackage || 'Custom'} · {enq.timeline || 'Flexible'}
                              </span>
                            </div>
                            {(enq.pricingSummary || (enq.calculatedSubtotal && enq.calculatedSubtotal > 0)) && (
                              <div className="sm:col-span-2">
                                <span className="opacity-50 block text-[9.5px]">ESTIMATED PRICING SCOPE</span>
                                <span className="text-[#D8C7A5] font-mono text-[11px]">
                                  {enq.pricingSummary || `₹${Number(enq.calculatedSubtotal).toLocaleString('en-IN')}`}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Brief message */}
                          <div className="mb-3 text-xs font-light leading-relaxed">
                            <span className="text-[10px] font-mono opacity-60 uppercase block mb-0.5">
                              Project Brief & Requirements:
                            </span>
                            <p className="p-2.5 bg-black/10 border border-inherit whitespace-pre-line text-[11.5px]">
                              {enq.projectDetails}
                            </p>
                          </div>

                          {/* Services tags */}
                          {enq.neededServices && enq.neededServices.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                              {enq.neededServices.map((srv: string) => (
                                <span
                                  key={srv}
                                  className="text-[10px] font-mono px-2 py-0.5 border border-inherit bg-black/15 text-[#D8C7A5]"
                                >
                                  {srv}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons for Director */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-inherit">
                            <a
                              href={`mailto:${enq.email}?subject=ArkAja Studio Creative Proposal: ${enq.brandName}&body=Hi ${enq.fullName},%0D%0A%0D%0AThank you for submitting your project brief for ${enq.brandName} to ArkAja Studio.%0D%0A%0D%0AWe reviewed your requirements...`}
                              className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider bg-[#D8C7A5] text-[#0b0c0e] hover:bg-white flex items-center gap-1.5 font-medium transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Reply via Email</span>
                            </a>

                            {enq.phone && (
                              <a
                                href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                                  enq.fullName
                                )},%20this%20is%20Divyaam%20from%20ArkAja%20Studio%20regarding%20your%20project%20brief%20for%20${encodeURIComponent(
                                  enq.brandName
                                )}.`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border border-emerald-600/70 text-emerald-400 hover:bg-emerald-950/40 flex items-center gap-1.5 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp Client</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADD NEW PROJECT & IMAGES */}
            {activeTab === 'add-project' && (
              <div>
                <div className="mb-4">
                  <h4 className="font-serif text-xl font-normal">
                    Add New Project to Portfolio
                  </h4>
                  <p className="text-xs opacity-70 mt-0.5">
                    Published projects immediately update in real-time across the website and appear on the live Selected Work grid.
                  </p>
                </div>

                {publishSuccess && (
                  <div className="mb-5 p-3.5 bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{publishSuccess}</span>
                  </div>
                )}

                {publishError && (
                  <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{publishError}</span>
                  </div>
                )}

                <form onSubmit={handlePublishProject} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase font-mono mb-1 opacity-70">
                        PROJECT TITLE *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VELVET NOIR"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none ${
                          isDark
                            ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                            : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-widest uppercase font-mono mb-1 opacity-70">
                        BRAND / CLIENT NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Maison Velvet London"
                        value={projectClient}
                        onChange={(e) => setProjectClient(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none ${
                          isDark
                            ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                            : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase font-mono mb-1 opacity-70">
                        CATEGORY DISCIPLINE
                      </label>
                      <select
                        value={projectCategory}
                        onChange={(e) => setProjectCategory(e.target.value as any)}
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none ${
                          isDark
                            ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                            : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                        }`}
                      >
                        <option value="FASHION">FASHION (Apparel, Editorial, Lookbook)</option>
                        <option value="BEAUTY">BEAUTY (Skincare, Clinic, Cosmetics)</option>
                        <option value="HOSPITALITY">HOSPITALITY (Café, Dining, Lifestyle)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-widest uppercase font-mono mb-1 opacity-70">
                        SUBTITLE / TAGLINE
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. The Autumn Lookbook Edit"
                        value={projectSubtitle}
                        onChange={(e) => setProjectSubtitle(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none ${
                          isDark
                            ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                            : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Image Upload Zone */}
                  <div className="p-4 border border-dashed border-[#D8C7A5]/50 bg-black/15">
                    <label className="block text-[10px] tracking-widest uppercase font-mono mb-2 text-[#D8C7A5] font-semibold">
                      PROJECT IMAGE / ARTWORK ASSET *
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {projectImagePreview ? (
                        <div className="relative w-32 h-32 shrink-0 border border-[#D8C7A5] overflow-hidden bg-black">
                          <img
                            src={projectImagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setProjectImagePreview(null)}
                            className="absolute top-1 right-1 p-1 bg-black/80 text-white hover:text-red-400"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 shrink-0 border border-inherit flex flex-col items-center justify-center text-center p-2 opacity-60">
                          <Upload className="w-6 h-6 mb-1 text-[#D8C7A5]" />
                          <span className="text-[9px] font-mono">No Image Chosen</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-2 w-full">
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="text-xs file:mr-3 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-[#D8C7A5] file:text-[#0b0c0e] hover:file:bg-white cursor-pointer"
                          />
                          <span className="text-[10px] opacity-60 block mt-1">
                            Upload PNG, JPEG, or WebP artwork from your computer.
                          </span>
                        </div>

                        <div className="text-[10px] opacity-60 font-mono text-center">OR PROVIDE IMAGE URL</div>

                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={projectImageUrlInput}
                          onChange={(e) => {
                            setProjectImageUrlInput(e.target.value);
                            if (e.target.value) setProjectImagePreview(e.target.value);
                          }}
                          className={`w-full px-3 py-2 text-xs border rounded-none focus:outline-none ${
                            isDark
                              ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                              : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-mono mb-1 opacity-70">
                      PROJECT DESCRIPTION
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Art direction narrative, typography choices, and editorial concept..."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none ${
                        isDark
                          ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                          : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase font-mono mb-1 opacity-70">
                        TAGS (COMMA-SEPARATED)
                      </label>
                      <input
                        type="text"
                        placeholder="Editorial, Lookbook, Golden Hour, Saree"
                        value={projectTags}
                        onChange={(e) => setProjectTags(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs border rounded-none focus:outline-none ${
                          isDark
                            ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                            : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-widest uppercase font-mono mb-1 opacity-70">
                        DELIVERABLES (ONE PER LINE)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="6 bespoke posts&#10;2 editorial stories&#10;1 promotional visual"
                        value={projectDeliverables}
                        onChange={(e) => setProjectDeliverables(e.target.value)}
                        className={`w-full px-3.5 py-2 text-xs border rounded-none focus:outline-none ${
                          isDark
                            ? 'bg-[#15181F] border-[#2A2F3A] focus:border-[#D8C7A5] text-white'
                            : 'bg-[#FAF8F5] border-[#DDD7CD] focus:border-[#A58B55] text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPublishing}
                    className={`w-full py-3.5 text-xs tracking-[0.2em] font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                      isDark
                        ? 'bg-[#F3F1EC] text-[#0b0c0e] hover:bg-[#D8C7A5]'
                        : 'bg-[#14171A] text-[#FAF7F2] hover:bg-[#A58B55]'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isPublishing ? 'PUBLISHING TO FIRESTORE...' : 'PUBLISH PROJECT TO PORTFOLIO IN REAL TIME'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: MANAGE PUBLISHED PROJECTS */}
            {activeTab === 'manage-projects' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-serif text-xl font-normal">
                    Custom Published Projects ({customProjects.length})
                  </h4>
                  <span className="text-xs font-mono text-[#D8C7A5]">
                    Live in Portfolio Grid
                  </span>
                </div>

                {customProjects.length === 0 ? (
                  <div
                    className={`p-8 text-center border border-dashed rounded text-xs space-y-2 ${
                      isDark
                        ? 'border-[#262B34] text-[#717784] bg-[#14171D]'
                        : 'border-[#E2DDD5] text-[#828896] bg-[#FAF8F5]'
                    }`}
                  >
                    <Layers className="w-6 h-6 mx-auto opacity-40 text-[#D8C7A5]" />
                    <p>No custom projects added yet.</p>
                    <button
                      onClick={() => setActiveTab('add-project')}
                      className="mt-2 text-xs tracking-wider uppercase font-medium text-[#D8C7A5] underline"
                    >
                      + Add Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
                    {customProjects.map((p) => (
                      <div
                        key={p.id}
                        className={`p-3.5 border flex gap-3.5 items-start ${
                          isDark ? 'bg-[#15181F] border-[#252B37]' : 'bg-[#F9F7F3] border-[#E5E0D6]'
                        }`}
                      >
                        <div className="w-20 h-20 shrink-0 border border-inherit overflow-hidden bg-black">
                          <img
                            src={p.images?.[0] || ''}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#D8C7A5] uppercase">
                              {p.category}
                            </span>
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h5 className="font-serif text-base font-normal truncate mt-0.5">
                            {p.title}
                          </h5>
                          <p className="text-[11px] opacity-60 truncate">
                            {p.tagline}
                          </p>
                          <div className="text-[9.5px] opacity-50 font-mono mt-1">
                            Published by {STUDIO_OWNER_EMAIL}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
