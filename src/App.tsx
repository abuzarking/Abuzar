import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Zap,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Type,
  Image as ImageIcon,
  HardDrive,
  Info,
} from 'lucide-react';
import { Project, Clip } from './types';
import { STARTER_PROJECTS } from './data/presetProjects';
import {
  signInWithGoogleDrive,
  signOutUser,
  onAuthStateChangedListener,
  getStoredDriveAccessToken,
} from './firebase';
import { Navbar } from './components/Navbar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { Timeline } from './components/Timeline';
import { TransitionPicker } from './components/TransitionPicker';
import { AnimationPicker } from './components/AnimationPicker';
import { EffectsPanel } from './components/EffectsPanel';
import { ImageGenModal } from './components/ImageGenModal';
import { DriveModal } from './components/DriveModal';
import { GeminiChatDrawer } from './components/GeminiChatDrawer';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Project & Timeline State
  const [project, setProject] = useState<Project>(STARTER_PROJECTS[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(
    STARTER_PROJECTS[0].clips[0]?.id || null
  );

  // Inspector Tab State: 'transitions' | 'animations' | 'effects'
  const [inspectorTab, setInspectorTab] = useState<'transitions' | 'animations' | 'effects'>('transitions');

  // Modals & Drawers
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Google User & Drive OAuth State
  const [user, setUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(getStoredDriveAccessToken());

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((currentUser: User | null) => {
      setUser(currentUser);
      setDriveToken(getStoredDriveAccessToken());
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setUser(res.user);
        setDriveToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setDriveToken(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Playback Loop using requestAnimationFrame
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= project.duration) {
          setIsPlaying(false);
          return 0; // Loop back to start
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, project.duration]);

  // Keyboard Shortcuts (Space: Play/Pause, Esc: Deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 0.5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(project.duration, t + 0.5));
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          handleDeleteClip(selectedClipId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, project.duration]);

  // Active Selected Clip
  const selectedClip = project.clips.find((c) => c.id === selectedClipId) || null;

  // Clip Modifications
  const handleUpdateClip = (updated: Clip) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => (c.id === updated.id ? updated : c)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDeleteClip = (clipId: string) => {
    setProject((prev) => ({
      ...prev,
      clips: prev.clips.filter((c) => c.id !== clipId),
      updatedAt: new Date().toISOString(),
    }));
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  };

  const handleDuplicateClip = (clipId: string) => {
    const target = project.clips.find((c) => c.id === clipId);
    if (!target) return;

    const newClip: Clip = {
      ...target,
      id: `clip-${Date.now()}`,
      name: `${target.name} (Copy)`,
      startTime: Math.min(project.duration - 1, target.startTime + 0.8),
    };

    setProject((prev) => ({
      ...prev,
      clips: [...prev.clips, newClip],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedClipId(newClip.id);
  };

  const handleAddClip = (
    trackId: string,
    type: 'text' | 'image' | 'shape' | 'audio'
  ) => {
    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      trackId,
      type,
      name: type === 'text' ? 'New Animated Text' : 'New Visual Layer',
      startTime: currentTime,
      duration: 3.5,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 1,
      entranceAnimation: 'pop',
      continuousAnimation: 'glow-breathe',
      exitAnimation: 'fade-out',
      transitionIn: 'wipe-right',
      transitionDuration: 0.7,
      filter: 'none',
      particleEffect: 'none',
      text: type === 'text' ? 'MOTION IMPACT' : undefined,
      fontSize: 40,
      color: '#38bdf8',
      fontWeight: 'bold',
      src:
        type === 'image'
          ? 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80'
          : undefined,
    };

    setProject((prev) => ({
      ...prev,
      clips: [...prev.clips, newClip],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedClipId(newClip.id);
  };

  const handleAddClipFromModal = (clipData: Partial<Clip>) => {
    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      trackId: 'track-media',
      type: clipData.type || 'image',
      name: clipData.name || 'AI Asset',
      startTime: currentTime,
      duration: clipData.duration || 4,
      x: clipData.x ?? 50,
      y: clipData.y ?? 50,
      scale: clipData.scale ?? 1,
      rotation: clipData.rotation ?? 0,
      opacity: clipData.opacity ?? 1,
      entranceAnimation: clipData.entranceAnimation || 'kinetic-scale',
      continuousAnimation: clipData.continuousAnimation || 'float',
      exitAnimation: clipData.exitAnimation || 'none',
      transitionIn: clipData.transitionIn || 'glitch',
      transitionDuration: clipData.transitionDuration || 0.8,
      filter: clipData.filter || 'none',
      particleEffect: clipData.particleEffect || 'sparkles',
      src: clipData.src,
    };

    setProject((prev) => ({
      ...prev,
      clips: [...prev.clips, newClip],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedClipId(newClip.id);
  };

  const handleSelectStarter = (presetId: string) => {
    if (presetId === 'custom') {
      setProject({
        id: `project-${Date.now()}`,
        title: 'Untitled Motion Project',
        duration: 10,
        fps: 60,
        aspectRatio: '16:9',
        background: '#090a0f',
        updatedAt: new Date().toISOString(),
        tracks: [
          { id: 'track-text', name: 'Text & Titles', type: 'text', muted: false, locked: false, visible: true, color: '#ec4899' },
          { id: 'track-media', name: 'Media Layer', type: 'media', muted: false, locked: false, visible: true, color: '#06b6d4' },
        ],
        clips: [],
      });
      setSelectedClipId(null);
      setCurrentTime(0);
      return;
    }

    const starter = STARTER_PROJECTS.find((p) => p.id === presetId);
    if (starter) {
      setProject(starter);
      setSelectedClipId(starter.clips[0]?.id || null);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Studio Navigation Bar */}
      <Navbar
        project={project}
        onProjectChange={setProject}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onResetTime={() => setCurrentTime(0)}
        currentTime={currentTime}
        user={user}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onToggleChat={() => setIsChatOpen((c) => !c)}
        isChatOpen={isChatOpen}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onSelectStarter={handleSelectStarter}
      />

      {/* 2. Main Center Workspace: Canvas + Right Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Live Canvas Viewport */}
        <PreviewCanvas
          project={project}
          currentTime={currentTime}
          selectedClipId={selectedClipId}
          onSelectClip={setSelectedClipId}
          onUpdateClip={handleUpdateClip}
        />

        {/* Right Inspector: Transitions, Animations & Effects */}
        <aside className="w-80 bg-slate-925 border-l border-slate-800 flex flex-col shrink-0 z-20">
          {/* Tab Navigation */}
          <div className="h-11 bg-slate-900 border-b border-slate-800 px-2 flex items-center justify-around">
            <button
              id="tab-transitions"
              onClick={() => setInspectorTab('transitions')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                inspectorTab === 'transitions'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-300" />
              <span>Transitions</span>
            </button>

            <button
              id="tab-animations"
              onClick={() => setInspectorTab('animations')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                inspectorTab === 'animations'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Animations</span>
            </button>

            <button
              id="tab-effects"
              onClick={() => setInspectorTab('effects')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                inspectorTab === 'effects'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-pink-300" />
              <span>FX & Style</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedClip ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                      Selected Layer
                    </span>
                    <h3 className="text-xs font-bold text-white truncate max-w-[180px]">
                      {selectedClip.text ? `"${selectedClip.text}"` : selectedClip.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedClip.type}
                  </span>
                </div>

                {inspectorTab === 'transitions' && (
                  <TransitionPicker clip={selectedClip} onUpdateClip={handleUpdateClip} />
                )}

                {inspectorTab === 'animations' && (
                  <AnimationPicker clip={selectedClip} onUpdateClip={handleUpdateClip} />
                )}

                {inspectorTab === 'effects' && (
                  <EffectsPanel clip={selectedClip} onUpdateClip={handleUpdateClip} />
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">No Layer Selected</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click any clip on the timeline or canvas to configure its transitions, motion animations, and visual styling.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. Bottom Multi-Track Timeline */}
      <Timeline
        project={project}
        currentTime={currentTime}
        onSeek={setCurrentTime}
        selectedClipId={selectedClipId}
        onSelectClip={setSelectedClipId}
        onUpdateClip={handleUpdateClip}
        onDeleteClip={handleDeleteClip}
        onDuplicateClip={handleDuplicateClip}
        onAddClip={handleAddClip}
      />

      {/* 4. Modals & Drawers */}
      {/* 1K/2K/4K AI Image Studio Modal */}
      <ImageGenModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onAddClipToTimeline={handleAddClipFromModal}
        accessToken={driveToken}
        onRequireAuth={handleGoogleSignIn}
      />

      {/* Google Drive Studio Hub Modal */}
      <DriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        accessToken={driveToken}
        onSignIn={handleGoogleSignIn}
        project={project}
        onAddClipToTimeline={handleAddClipFromModal}
      />

      {/* Gemini Multi-turn Chat Assistant Drawer */}
      <GeminiChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        project={project}
      />

      {/* Export & Share Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        accessToken={driveToken}
        onSignIn={handleGoogleSignIn}
      />
    </div>
  );
}
