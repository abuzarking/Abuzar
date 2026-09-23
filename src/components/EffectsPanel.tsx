import React from 'react';
import {
  Sliders,
  Sparkles,
  Flame,
  CloudRain,
  Palette,
  RotateCw,
  Move,
  Type,
  Type as FontIcon,
} from 'lucide-react';
import { Clip, ColorFilterPreset, ParticlePreset } from '../types';

interface EffectsPanelProps {
  clip: Clip;
  onUpdateClip: (clip: Clip) => void;
}

const FILTERS: { id: ColorFilterPreset; label: string; badge: string }[] = [
  { id: 'none', label: 'Normal (Raw)', badge: 'Neutral' },
  { id: 'cinematic-teal-orange', label: 'Cinematic Teal & Orange', badge: 'Hollywood' },
  { id: 'cyberpunk-neon', label: 'Cyberpunk Neon', badge: 'Sci-Fi' },
  { id: 'vintage-70s', label: 'Vintage 1970s Film', badge: 'Retro' },
  { id: 'noir-bw', label: 'Monochrome Noir', badge: 'Classic' },
  { id: 'golden-hour', label: 'Golden Hour Glow', badge: 'Warm' },
  { id: 'matrix-emerald', label: 'Matrix Emerald', badge: 'Digital' },
];

const PARTICLES: { id: ParticlePreset; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '—' },
  { id: 'sparkles', label: 'Magic Stardust', icon: '✨' },
  { id: 'fire-embers', label: 'Fire Embers', icon: '🔥' },
  { id: 'electric-sparks', label: 'Electric Sparks', icon: '⚡' },
  { id: 'bokeh-orbs', label: 'Floating Bokeh', icon: '🟡' },
  { id: 'confetti', label: 'Celebration Confetti', icon: '🎉' },
];

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ clip, onUpdateClip }) => {
  return (
    <div className="space-y-4">
      {/* If Text Clip, show text editor properties */}
      {clip.type === 'text' && (
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
            <Type className="w-3.5 h-3.5 text-pink-400" />
            <span>Text Content & Style</span>
          </div>
          <input
            id="input-text-content"
            type="text"
            value={clip.text || ''}
            onChange={(e) => onUpdateClip({ ...clip, text: e.target.value })}
            placeholder="Type your headline or caption..."
            className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={clip.color || '#38bdf8'}
                  onChange={(e) => onUpdateClip({ ...clip, color: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-300">{clip.color}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Font Size ({clip.fontSize || 36}px)</label>
              <input
                type="range"
                min="18"
                max="80"
                value={clip.fontSize || 36}
                onChange={(e) => onUpdateClip({ ...clip, fontSize: parseInt(e.target.value) })}
                className="w-full accent-pink-400 cursor-pointer h-1.5 bg-slate-750 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Transform Coordinates (Scale, Rotation, Opacity) */}
      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
          <Move className="w-3.5 h-3.5 text-cyan-400" />
          <span>Transform & Coordinates</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Position X ({clip.x}%)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={clip.x}
              onChange={(e) => onUpdateClip({ ...clip, x: parseInt(e.target.value) })}
              className="w-32 accent-cyan-400 cursor-pointer h-1 bg-slate-700 rounded"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Position Y ({clip.y}%)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={clip.y}
              onChange={(e) => onUpdateClip({ ...clip, y: parseInt(e.target.value) })}
              className="w-32 accent-cyan-400 cursor-pointer h-1 bg-slate-700 rounded"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Scale ({clip.scale.toFixed(1)}x)</span>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={clip.scale}
              onChange={(e) => onUpdateClip({ ...clip, scale: parseFloat(e.target.value) })}
              className="w-32 accent-cyan-400 cursor-pointer h-1 bg-slate-700 rounded"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Rotation ({clip.rotation}°)</span>
            <input
              type="range"
              min="-180"
              max="180"
              value={clip.rotation}
              onChange={(e) => onUpdateClip({ ...clip, rotation: parseInt(e.target.value) })}
              className="w-32 accent-cyan-400 cursor-pointer h-1 bg-slate-700 rounded"
            />
          </div>
        </div>
      </div>

      {/* Color Grading Filter Presets */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Cinematic Color Grading</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {FILTERS.map((f) => {
            const isSelected = clip.filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onUpdateClip({ ...clip, filter: f.id })}
                className={`p-2 rounded-lg text-left border transition text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-950/60 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <span className="font-semibold truncate">{f.label}</span>
                <span className="text-[9px] text-amber-400 font-mono mt-0.5">{f.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Particle Overlays */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Dynamic Particle Overlays</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {PARTICLES.map((p) => {
            const isSelected = clip.particleEffect === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onUpdateClip({ ...clip, particleEffect: p.id })}
                className={`px-2.5 py-2 rounded-lg text-left border transition text-xs flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <span>{p.icon}</span>
                <span className="font-semibold truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
