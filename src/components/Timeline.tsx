import React, { useRef } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Split,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Type,
  Square,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Project, Clip, Track, TransitionType } from '../types';

interface TimelineProps {
  project: Project;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onUpdateClip: (clip: Clip) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onAddClip: (trackId: string, type: 'text' | 'image' | 'shape' | 'audio') => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  onSeek,
  selectedClipId,
  onSelectClip,
  onUpdateClip,
  onDeleteClip,
  onDuplicateClip,
  onAddClip,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const totalDuration = project.duration || 12;

  // Handle scrubber click or drag
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = (x / rect.width) * totalDuration;
    onSeek(newTime);
  };

  return (
    <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col select-none shrink-0">
      {/* Top Toolbar: Timeline Actions & Adders */}
      <div className="h-10 bg-slate-850 border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tracks & Timeline</span>

          <div className="h-4 w-px bg-slate-750" />

          {/* Quick Add Elements */}
          <button
            id="btn-add-text-clip"
            onClick={() => onAddClip('track-text', 'text')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Type className="w-3.5 h-3.5 text-pink-400" />
            <span>Add Text</span>
          </button>

          <button
            id="btn-add-media-clip"
            onClick={() => onAddClip('track-media', 'image')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Media</span>
          </button>
        </div>

        {/* Selected Clip Quick Operations */}
        {selectedClipId && (
          <div className="flex items-center space-x-2">
            <button
              id="btn-duplicate-clip"
              onClick={() => onDuplicateClip(selectedClipId)}
              title="Duplicate Clip"
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-delete-clip"
              onClick={() => onDeleteClip(selectedClipId)}
              title="Delete Clip"
              className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Track Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Column) */}
        <div className="w-48 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          {/* Top ruler placeholder */}
          <div className="h-7 border-b border-slate-800 bg-slate-925 px-3 flex items-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Layer Header</span>
          </div>

          {/* Track Labels */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {project.tracks.map((track) => (
              <div key={track.id} className="h-12 px-3 flex items-center justify-between hover:bg-slate-850/50">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: track.color }} />
                  <span className="text-xs font-medium text-slate-300 truncate">{track.name}</span>
                </div>
                <div className="flex items-center space-x-1 shrink-0 text-slate-500">
                  <button className="p-1 hover:text-slate-300">
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Tracks & Scrubber (Right Column) */}
        <div className="flex-1 flex flex-col overflow-x-auto relative bg-slate-950/50">
          {/* Timeline Ruler */}
          <div
            ref={rulerRef}
            onClick={handleRulerClick}
            className="h-7 bg-slate-900/90 border-b border-slate-800 relative cursor-pointer select-none"
          >
            {/* Tick Marks */}
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => {
              const leftPercent = (sec / totalDuration) * 100;
              return (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 border-l border-slate-700/60 pointer-events-none flex flex-col justify-between pl-1"
                  style={{ left: `${leftPercent}%` }}
                >
                  <span className="text-[9px] font-mono text-slate-400">{sec}s</span>
                  <div className="h-1.5 w-px bg-slate-600" />
                </div>
              );
            })}

            {/* Playhead Marker on Ruler */}
            <div
              className="absolute top-0 bottom-0 w-3 -ml-1.5 flex flex-col items-center pointer-events-none z-20"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            >
              <div className="w-3 h-3 bg-cyan-400 rotate-45 transform -translate-y-1 shadow-md shadow-cyan-400/50" />
              <div className="w-0.5 flex-1 bg-cyan-400 shadow-sm" />
            </div>
          </div>

          {/* Track Lanes */}
          <div className="flex-1 relative divide-y divide-slate-800/40">
            {/* Global Playhead Needle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 pointer-events-none z-20 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            />

            {project.tracks.map((track) => {
              const trackClips = project.clips.filter((c) => c.trackId === track.id);
              return (
                <div key={track.id} className="h-12 relative bg-slate-900/30">
                  {trackClips.map((clip) => {
                    const left = (clip.startTime / totalDuration) * 100;
                    const width = (clip.duration / totalDuration) * 100;
                    const isSelected = selectedClipId === clip.id;

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClip(clip.id);
                        }}
                        className={`absolute top-1.5 bottom-1.5 rounded-lg px-2 flex items-center justify-between cursor-pointer text-xs font-semibold overflow-hidden transition-all group ${
                          isSelected
                            ? 'ring-2 ring-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-lg shadow-cyan-500/20'
                            : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700/60'
                        }`}
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          borderLeftWidth: '4px',
                          borderLeftColor: track.color,
                        }}
                      >
                        {/* Clip Title & Transition Indicator */}
                        <div className="flex items-center space-x-1.5 truncate">
                          {clip.transitionIn !== 'none' && (
                            <span
                              title={`Transition: ${clip.transitionIn}`}
                              className="px-1 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[9px] uppercase font-bold tracking-tight border border-indigo-500/40 flex items-center space-x-0.5"
                            >
                              <Zap className="w-2.5 h-2.5" />
                              <span>{clip.transitionIn}</span>
                            </span>
                          )}
                          <span className="truncate">{clip.text ? `"${clip.text}"` : clip.name}</span>
                        </div>

                        {/* Clip Duration Badge */}
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                          {clip.duration}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
