export type ClipType = 'video' | 'image' | 'text' | 'shape' | 'audio';

export type TransitionType =
  | 'none'
  | 'fade'
  | 'crossfade'
  | 'wipe-left'
  | 'wipe-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'glitch'
  | 'film-burn'
  | 'cube-rotate'
  | 'slide-left'
  | 'slide-right'
  | 'elastic-bounce'
  | 'clock-wipe'
  | 'ripple'
  | 'iris'
  | 'shutter';

export type EntranceAnimation =
  | 'none'
  | 'pop'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'fade-in'
  | 'kinetic-scale'
  | 'spin-in'
  | 'typewriter'
  | 'elastic-drop'
  | 'neon-flicker';

export type ContinuousAnimation =
  | 'none'
  | 'pulse'
  | 'float'
  | 'rotate'
  | 'shake'
  | 'glow-breathe'
  | 'wave'
  | 'pendulum';

export type ExitAnimation =
  | 'none'
  | 'fade-out'
  | 'shrink'
  | 'slide-out-left'
  | 'slide-out-right'
  | 'slide-out-down'
  | 'explode'
  | 'glitch-out';

export type ColorFilterPreset =
  | 'none'
  | 'cinematic-teal-orange'
  | 'vintage-70s'
  | 'cyberpunk-neon'
  | 'noir-bw'
  | 'dreamy-pastel'
  | 'golden-hour'
  | 'matrix-emerald';

export type ParticlePreset =
  | 'none'
  | 'sparkles'
  | 'fire-embers'
  | 'rain'
  | 'confetti'
  | 'bokeh-orbs'
  | 'electric-sparks';

export interface Clip {
  id: string;
  trackId: string;
  type: ClipType;
  name: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  src?: string; // Image or Video URL
  text?: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  backgroundColor?: string;
  x: number; // 0 - 100 percentage of canvas width
  y: number; // 0 - 100 percentage of canvas height
  scale: number;
  rotation: number; // degrees
  opacity: number; // 0 - 1
  entranceAnimation: EntranceAnimation;
  continuousAnimation: ContinuousAnimation;
  exitAnimation: ExitAnimation;
  transitionIn: TransitionType;
  transitionDuration: number;
  filter: ColorFilterPreset;
  particleEffect: ParticlePreset;
  volume?: number;
  speed?: number;
  // Audio synthesizer tone type if audio
  synthSound?: 'cinematic-beat' | 'lofi-ambient' | 'synthwave-pulse' | 'riser-whoosh' | 'pop-click';
}

export interface Track {
  id: string;
  name: string;
  type: 'media' | 'text' | 'shapes' | 'audio' | 'fx';
  muted: boolean;
  locked: boolean;
  visible: boolean;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  duration: number; // in seconds
  fps: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  tracks: Track[];
  clips: Clip[];
  background: string;
  updatedAt: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  modifiedTime?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp: number | string;
  modelUsed?: string;
}

export type GeminiChatModel =
  | 'gemini-3.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.1-flash-lite';
