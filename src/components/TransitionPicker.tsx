import React from 'react';
import {
  Zap,
  Layers,
  Sparkles,
  MoveRight,
  MoveLeft,
  MoveUp,
  MoveDown,
  Maximize2,
  Minimize2,
  Film,
  RotateCw,
  Clock,
  Radio,
  Camera,
  Activity,
} from 'lucide-react';
import { Clip, TransitionType } from '../types';

interface TransitionPickerProps {
  clip: Clip;
  onUpdateClip: (clip: Clip) => void;
}

interface TransitionItem {
  id: TransitionType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TRANSITIONS_LIST: TransitionItem[] = [
  { id: 'none', label: 'Cut (None)', icon: <Layers className="w-4 h-4" />, description: 'Instant cut without transition' },
  { id: 'crossfade', label: 'Cross Dissolve', icon: <Layers className="w-4 h-4 text-cyan-400" />, description: 'Smooth cinematic fade-through' },
  { id: 'wipe-right', label: 'Wipe Right', icon: <MoveRight className="w-4 h-4 text-pink-400" />, description: 'Horizontal wipe to the right' },
  { id: 'wipe-left', label: 'Wipe Left', icon: <MoveLeft className="w-4 h-4 text-pink-400" />, description: 'Horizontal wipe to the left' },
  { id: 'wipe-down', label: 'Wipe Down', icon: <MoveDown className="w-4 h-4 text-pink-400" />, description: 'Vertical slide down curtain' },
  { id: 'wipe-up', label: 'Wipe Up', icon: <MoveUp className="w-4 h-4 text-pink-400" />, description: 'Vertical push upwards' },
  { id: 'zoom-in', label: 'Hyper Zoom In', icon: <Maximize2 className="w-4 h-4 text-amber-400" />, description: 'Rapid scale punch into scene' },
  { id: 'zoom-out', label: 'Zoom Out Reveal', icon: <Minimize2 className="w-4 h-4 text-amber-400" />, description: 'Starts oversized and zooms into frame' },
  { id: 'glitch', label: 'Cyber Glitch', icon: <Activity className="w-4 h-4 text-emerald-400" />, description: 'RGB chromatic shift & jitter' },
  { id: 'film-burn', label: 'Film Burn Light', icon: <Film className="w-4 h-4 text-orange-400" />, description: 'Warm optical flare & exposure pop' },
  { id: 'cube-rotate', label: '3D Cube Rotate', icon: <RotateCw className="w-4 h-4 text-purple-400" />, description: 'Geometric 3D turning perspective' },
  { id: 'clock-wipe', label: 'Radial Clock', icon: <Clock className="w-4 h-4 text-cyan-400" />, description: '360 degree radial sweep' },
  { id: 'iris', label: 'Circle Iris Expand', icon: <Radio className="w-4 h-4 text-indigo-400" />, description: 'Classic circular lens expand' },
  { id: 'shutter', label: 'Camera Shutter', icon: <Camera className="w-4 h-4 text-rose-400" />, description: 'High-speed lens flash click' },
  { id: 'ripple', label: 'Ripple Wave', icon: <Sparkles className="w-4 h-4 text-teal-400" />, description: 'Liquid shockwave pulse' },
];

export const TransitionPicker: React.FC<TransitionPickerProps> = ({ clip, onUpdateClip }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Transitions Library</h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">15+ Built-in FX</span>
      </div>

      {/* Transition Duration Slider */}
      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-slate-300">Transition Duration</span>
          <span className="font-mono text-cyan-400 font-bold">{clip.transitionDuration}s</span>
        </div>
        <input
          id="range-transition-duration"
          type="range"
          min="0.2"
          max="2.5"
          step="0.1"
          value={clip.transitionDuration}
          onChange={(e) => onUpdateClip({ ...clip, transitionDuration: parseFloat(e.target.value) })}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
        />
      </div>

      {/* Transition Grid Cards */}
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
        {TRANSITIONS_LIST.map((t) => {
          const isSelected = clip.transitionIn === t.id;
          return (
            <button
              key={t.id}
              id={`transition-btn-${t.id}`}
              onClick={() => onUpdateClip({ ...clip, transitionIn: t.id })}
              className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className={`p-1 rounded-lg ${isSelected ? 'bg-indigo-500/30' : 'bg-slate-800'}`}>
                  {t.icon}
                </div>
                <span className="text-xs font-bold truncate">{t.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">{t.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
