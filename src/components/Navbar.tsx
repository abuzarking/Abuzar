import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  HardDrive,
  MessageSquare,
  Share2,
  FolderOpen,
  Plus,
  Tv,
  Smartphone,
  Square,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Project } from '../types';

interface NavbarProps {
  project: Project;
  onProjectChange: (proj: Project) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetTime: () => void;
  currentTime: number;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenDriveModal: () => void;
  onOpenImageModal: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onOpenExportModal: () => void;
  onSelectStarter: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  onProjectChange,
  isPlaying,
  onTogglePlay,
  onResetTime,
  currentTime,
  user,
  onSignIn,
  onSignOut,
  onOpenDriveModal,
  onOpenImageModal,
  onToggleChat,
  isChatOpen,
  onOpenExportModal,
  onSelectStarter,
}) => {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Branding & Project Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black tracking-tight text-white text-base">MotionCraft</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Animation & Video Studio</p>
          </div>
        </div>

        {/* Project Selector & Aspect Ratio */}
        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center space-x-2">
          <select
            id="preset-project-selector"
            className="bg-slate-800/90 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-cyan-500 hover:bg-slate-800"
            onChange={(e) => onSelectStarter(e.target.value)}
            defaultValue={project.id}
          >
            <option value="cyberpunk-reel">Cyberpunk Reel (Transitions)</option>
            <option value="cinematic-reel">Cinematic Travel (Memories)</option>
            <option value="custom">Blank Canvas</option>
          </select>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
            <button
              id="aspect-16-9"
              title="16:9 Landscape"
              onClick={() => onProjectChange({ ...project, aspectRatio: '16:9' })}
              className={`p-1.5 rounded text-xs font-medium flex items-center transition ${
                project.aspectRatio === '16:9'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
            <button
              id="aspect-9-16"
              title="9:16 Vertical"
              onClick={() => onProjectChange({ ...project, aspectRatio: '9:16' })}
              className={`p-1.5 rounded text-xs font-medium flex items-center transition ${
                project.aspectRatio === '9:16'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              id="aspect-1-1"
              title="1:1 Square"
              onClick={() => onProjectChange({ ...project, aspectRatio: '1:1' })}
              className={`p-1.5 rounded text-xs font-medium flex items-center transition ${
                project.aspectRatio === '1:1'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Center: Playback Controls & Timecode */}
      <div className="flex items-center space-x-3 bg-slate-950/70 px-4 py-1.5 rounded-xl border border-slate-800 shadow-inner">
        <button
          id="btn-reset-playback"
          title="Rewind to start"
          onClick={onResetTime}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-play"
          onClick={onTogglePlay}
          className={`px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-bold transition shadow-lg ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white shadow-cyan-500/25'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY PREVIEW'}</span>
        </button>

        <div className="font-mono text-xs text-slate-300 font-semibold px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
          <span className="text-cyan-400">{formatTime(currentTime)}</span>
          <span className="text-slate-500"> / {formatTime(project.duration)}</span>
        </div>
      </div>

      {/* Right: Tools & Google Integration */}
      <div className="flex items-center space-x-2.5">
        {/* Gemini AI Assistant Button */}
        <button
          id="btn-open-gemini-chat"
          onClick={onToggleChat}
          className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
            isChatOpen
              ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-purple-600/20 hover:border-purple-500/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>Gemini AI</span>
        </button>

        {/* 1K/2K/4K AI Image Studio */}
        <button
          id="btn-open-image-gen"
          onClick={onOpenImageModal}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-pink-600/20 hover:border-pink-500/50 transition"
        >
          <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
          <span>AI Generator (4K)</span>
        </button>

        {/* Google Drive Button */}
        <button
          id="btn-open-google-drive"
          onClick={onOpenDriveModal}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-400 transition"
        >
          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Drive</span>
        </button>

        {/* Export / Share */}
        <button
          id="btn-open-export"
          onClick={onOpenExportModal}
          className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/20"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Google User Auth Profile or Sign In */}
        <div className="h-6 w-px bg-slate-800" />

        {user ? (
          <div className="flex items-center space-x-2 bg-slate-800/80 pl-2 pr-1.5 py-1 rounded-full border border-slate-700">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google User'}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-xs text-slate-200 font-medium max-w-[90px] truncate">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <button
              id="btn-sign-out"
              onClick={onSignOut}
              title="Sign Out"
              className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-750 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            id="btn-google-sign-in"
            onClick={onSignIn}
            className="flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm transition border border-slate-300 active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  );
};
