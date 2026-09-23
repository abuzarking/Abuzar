import React from 'react';
import {
  Sparkles,
  Play,
  Repeat,
  LogOut,
  Maximize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  Activity,
  Radio,
  Type,
} from 'lucide-react';
import { Clip, EntranceAnimation, ContinuousAnimation, ExitAnimation } from '../types';

interface AnimationPickerProps {
  clip: Clip;
  onUpdateClip: (clip: Clip) => void;
}

const ENTRANCE_LIST: { id: EntranceAnimation; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '—' },
  { id: 'pop', label: 'Pop & Spring', icon: '💥' },
  { id: 'kinetic-scale', label: 'Kinetic Scale', icon: '🔍' },
  { id: 'slide-up', label: 'Slide Up', icon: '⬆️' },
  { id: 'slide-down', label: 'Slide Down', icon: '⬇️' },
  { id: 'slide-left', label: 'Slide Left', icon: '⬅️' },
  { id: 'slide-right', label: 'Slide Right', icon: '➡️' },
  { id: 'spin-in', label: '360° Spin In', icon: '🌀' },
  { id: 'typewriter', label: 'Typewriter', icon: '⌨️' },
  { id: 'elastic-drop', label: 'Elastic Drop', icon: '🪂' },
  { id: 'neon-flicker', label: 'Neon Strobe', icon: '⚡' },
  { id: 'fade-in', label: 'Soft Fade In', icon: '✨' },
];

const CONTINUOUS_LIST: { id: ContinuousAnimation; label: string; icon: string }[] = [
  { id: 'none', label: 'Static (None)', icon: '—' },
  { id: 'glow-breathe', label: 'Glow Breathe', icon: '💡' },
  { id: 'float', label: 'Zero-G Float', icon: '🛸' },
  { id: 'pulse', label: 'Heartbeat Pulse', icon: '💓' },
  { id: 'shake', label: 'Camera Shake', icon: '📳' },
  { id: 'wave', label: 'Harmonic Wave', icon: '🌊' },
  { id: 'pendulum', label: 'Pendulum Swing', icon: '⏱️' },
  { id: 'rotate', label: 'Endless Orbit', icon: '🔄' },
];

const EXIT_LIST: { id: ExitAnimation; label: string; icon: string }[] = [
  { id: 'none', label: 'Cut (None)', icon: '—' },
  { id: 'fade-out', label: 'Fade Out', icon: '💨' },
  { id: 'shrink', label: 'Shrink Center', icon: '🎯' },
  { id: 'slide-out-right', label: 'Slide Right', icon: '➡️' },
  { id: 'slide-out-left', label: 'Slide Left', icon: '⬅️' },
  { id: 'explode', label: 'Explode Out', icon: '💥' },
  { id: 'glitch-out', label: 'Cyber Glitch', icon: '👾' },
];

export const AnimationPicker: React.FC<AnimationPickerProps> = ({ clip, onUpdateClip }) => {
  return (
    <div className="space-y-4">
      {/* 1. Entrance Animations */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span>Entrance Animations</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {ENTRANCE_LIST.map((anim) => {
            const isSelected = clip.entranceAnimation === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => onUpdateClip({ ...clip, entranceAnimation: anim.id })}
                className={`px-2 py-2 rounded-lg text-xs font-semibold text-left border transition flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <span>{anim.icon}</span>
                <span className="truncate">{anim.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Continuous Loop Motion */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
          <Repeat className="w-3.5 h-3.5 text-cyan-400" />
          <span>Continuous Loop Motion</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {CONTINUOUS_LIST.map((anim) => {
            const isSelected = clip.continuousAnimation === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => onUpdateClip({ ...clip, continuousAnimation: anim.id })}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-left border transition flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <span>{anim.icon}</span>
                <span className="truncate">{anim.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Exit Animations */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Exit Animations</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {EXIT_LIST.map((anim) => {
            const isSelected = clip.exitAnimation === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => onUpdateClip({ ...clip, exitAnimation: anim.id })}
                className={`px-2 py-2 rounded-lg text-xs font-semibold text-left border transition flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <span>{anim.icon}</span>
                <span className="truncate">{anim.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
