import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Minimize2, Sparkles, Volume2, VolumeX, Eye } from 'lucide-react';
import { Project, Clip, TransitionType, ColorFilterPreset, ParticlePreset } from '../types';
import { playTransitionSound } from '../utils/audioSynth';

interface PreviewCanvasProps {
  project: Project;
  currentTime: number;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
  onUpdateClip: (clip: Clip) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  project,
  currentTime,
  selectedClipId,
  onSelectClip,
  onUpdateClip,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 960, height: 540 });

  // Store loaded images for instant drawing
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  // Track last fired transitions to avoid multi-trigger
  const lastTriggeredTransitionRef = useRef<string | null>(null);
  // Persistent particle simulation
  const particlesRef = useRef<Particle[]>([]);

  // Calculate container aspect ratio dimensions
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 32;
      const maxW = Math.max(320, rect.width - padding);
      const maxH = Math.max(240, rect.height - padding);

      let ratio = 16 / 9;
      if (project.aspectRatio === '9:16') ratio = 9 / 16;
      else if (project.aspectRatio === '1:1') ratio = 1;
      else if (project.aspectRatio === '4:3') ratio = 4 / 3;

      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }

      setDimensions({ width: Math.round(w), height: Math.round(h) });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [project.aspectRatio]);

  // Preload clip images
  useEffect(() => {
    project.clips.forEach((clip) => {
      if (clip.src && !imageCacheRef.current.has(clip.src)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = clip.src;
        img.onload = () => {
          imageCacheRef.current.set(clip.src!, img);
        };
      }
    });
  }, [project.clips]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set real canvas resolution matching dimensions
    const width = dimensions.width;
    const height = dimensions.height;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // 1. Draw Background
    ctx.fillStyle = project.background || '#090a0f';
    ctx.fillRect(0, 0, width, height);

    // 2. Identify Active Clips at currentTime
    const activeClips = project.clips.filter(
      (clip) => currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration
    );

    // Sort clips by track order (media bottom, shapes middle, text top)
    const trackOrder = ['track-media', 'track-graphics', 'track-text', 'track-audio'];
    activeClips.sort((a, b) => {
      const idxA = trackOrder.indexOf(a.trackId);
      const idxB = trackOrder.indexOf(b.trackId);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    // Check active particle overlays
    let activeParticlePreset: ParticlePreset = 'none';
    let activeFilterPreset: ColorFilterPreset = 'none';

    // 3. Render Each Active Clip
    activeClips.forEach((clip) => {
      if (clip.particleEffect && clip.particleEffect !== 'none') {
        activeParticlePreset = clip.particleEffect;
      }
      if (clip.filter && clip.filter !== 'none') {
        activeFilterPreset = clip.filter;
      }

      ctx.save();

      const timeInClip = currentTime - clip.startTime;
      const clipProgress = timeInClip / clip.duration;

      // Base position
      let posX = (clip.x / 100) * width;
      let posY = (clip.y / 100) * height;
      let scale = clip.scale || 1;
      let rotation = (clip.rotation || 0) * (Math.PI / 180);
      let opacity = clip.opacity ?? 1;

      // --- ENTRANCE ANIMATION CALCULATION ---
      const entranceTime = 0.8;
      if (timeInClip < entranceTime && clip.entranceAnimation !== 'none') {
        const p = Math.min(1, Math.max(0, timeInClip / entranceTime));
        switch (clip.entranceAnimation) {
          case 'pop': {
            // Overshoot spring
            const spring = Math.sin(p * Math.PI * 0.7) * 1.25;
            scale *= p < 0.8 ? spring : 1 + (1.25 - 1) * (1 - p) * 2;
            opacity *= p;
            break;
          }
          case 'slide-up':
            posY += (1 - p) * (height * 0.4);
            opacity *= p;
            break;
          case 'slide-down':
            posY -= (1 - p) * (height * 0.4);
            opacity *= p;
            break;
          case 'slide-left':
            posX += (1 - p) * (width * 0.5);
            opacity *= p;
            break;
          case 'slide-right':
            posX -= (1 - p) * (width * 0.5);
            opacity *= p;
            break;
          case 'fade-in':
            opacity *= p;
            break;
          case 'kinetic-scale':
            scale *= 0.2 + 0.8 * Math.pow(p, 0.5);
            opacity *= p;
            break;
          case 'spin-in':
            rotation += (1 - p) * Math.PI * 2;
            scale *= p;
            opacity *= p;
            break;
          case 'elastic-drop': {
            const decay = Math.exp(-4 * p) * Math.cos(p * Math.PI * 4);
            posY -= (height * 0.3) * decay;
            opacity *= p;
            break;
          }
          case 'neon-flicker': {
            const flicker = Math.random() > 0.3 ? 1 : 0.2;
            opacity *= (p * 0.7 + flicker * 0.3);
            break;
          }
        }
      }

      // --- CONTINUOUS ANIMATION CALCULATION ---
      if (clip.continuousAnimation !== 'none') {
        const loopTime = currentTime * 2.5;
        switch (clip.continuousAnimation) {
          case 'pulse':
            scale *= 1 + 0.06 * Math.sin(loopTime * 2);
            break;
          case 'float':
            posY += 8 * Math.sin(loopTime);
            posX += 4 * Math.cos(loopTime * 0.7);
            break;
          case 'rotate':
            rotation += currentTime * 0.5;
            break;
          case 'shake':
            posX += (Math.random() - 0.5) * 4;
            posY += (Math.random() - 0.5) * 4;
            break;
          case 'glow-breathe':
            scale *= 1 + 0.03 * Math.sin(loopTime * 1.5);
            opacity *= 0.9 + 0.1 * Math.sin(loopTime * 1.5);
            break;
          case 'wave':
            rotation += 0.08 * Math.sin(loopTime * 2);
            posY += 5 * Math.sin(loopTime * 3);
            break;
          case 'pendulum':
            rotation += 0.15 * Math.sin(loopTime * 1.8);
            break;
        }
      }

      // --- EXIT ANIMATION CALCULATION ---
      const exitDuration = 0.6;
      const timeUntilEnd = clip.startTime + clip.duration - currentTime;
      if (timeUntilEnd < exitDuration && clip.exitAnimation !== 'none') {
        const p = Math.max(0, timeUntilEnd / exitDuration); // 1 -> 0
        switch (clip.exitAnimation) {
          case 'fade-out':
            opacity *= p;
            break;
          case 'shrink':
            scale *= p;
            opacity *= p;
            break;
          case 'slide-out-left':
            posX -= (1 - p) * width * 0.5;
            opacity *= p;
            break;
          case 'slide-out-right':
            posX += (1 - p) * width * 0.5;
            opacity *= p;
            break;
          case 'explode':
            scale *= 1 + (1 - p) * 1.8;
            opacity *= Math.pow(p, 2);
            break;
          case 'glitch-out':
            posX += (Math.random() - 0.5) * 20 * (1 - p);
            opacity *= Math.random() > 0.3 ? p : 0;
            break;
        }
      }

      // --- TRANSITION IN (Wipes, Glitch, Film Burn, Zoom, Shutter) ---
      if (clip.transitionIn !== 'none' && clip.transitionDuration > 0) {
        const transDur = clip.transitionDuration;
        if (timeInClip < transDur) {
          const transP = timeInClip / transDur; // 0 -> 1

          // Trigger audio effect once when transition starts
          const transKey = `${clip.id}-${clip.transitionIn}`;
          if (soundEnabled && lastTriggeredTransitionRef.current !== transKey) {
            lastTriggeredTransitionRef.current = transKey;
            playTransitionSound(
              clip.transitionIn === 'glitch'
                ? 'glitch'
                : clip.transitionIn === 'shutter'
                ? 'shutter'
                : 'whoosh'
            );
          }

          // Apply transition clipping or effect
          switch (clip.transitionIn) {
            case 'fade':
            case 'crossfade':
              opacity *= transP;
              break;
            case 'wipe-right': {
              ctx.beginPath();
              ctx.rect(0, 0, width * transP, height);
              ctx.clip();
              break;
            }
            case 'wipe-left': {
              ctx.beginPath();
              ctx.rect(width * (1 - transP), 0, width * transP, height);
              ctx.clip();
              break;
            }
            case 'wipe-down': {
              ctx.beginPath();
              ctx.rect(0, 0, width, height * transP);
              ctx.clip();
              break;
            }
            case 'wipe-up': {
              ctx.beginPath();
              ctx.rect(0, height * (1 - transP), width, height * transP);
              ctx.clip();
              break;
            }
            case 'zoom-in':
              scale *= 0.3 + 0.7 * transP;
              opacity *= transP;
              break;
            case 'zoom-out':
              scale *= 2.0 - 1.0 * transP;
              opacity *= transP;
              break;
            case 'iris': {
              const maxR = Math.hypot(width / 2, height / 2);
              ctx.beginPath();
              ctx.arc(width / 2, height / 2, maxR * transP, 0, Math.PI * 2);
              ctx.clip();
              break;
            }
            case 'glitch': {
              // Chromatic RGB displacement effect
              const displacement = (1 - transP) * 18;
              posX += (Math.random() - 0.5) * displacement;
              break;
            }
            case 'shutter': {
              const flash = Math.sin(transP * Math.PI * 3);
              if (flash > 0.5) opacity = 0.2;
              break;
            }
            case 'clock-wipe': {
              const angle = transP * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(width / 2, height / 2);
              ctx.arc(width / 2, height / 2, Math.hypot(width, height), -Math.PI / 2, -Math.PI / 2 + angle);
              ctx.closePath();
              ctx.clip();
              break;
            }
            case 'cube-rotate': {
              posX += (1 - transP) * width * 0.4;
              scale *= 0.7 + 0.3 * transP;
              break;
            }
          }
        }
      }

      // Apply Transformations
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      ctx.translate(posX, posY);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Render Visual Type
      if (clip.type === 'image' && clip.src) {
        const cachedImg = imageCacheRef.current.get(clip.src);
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
          // Draw image centered
          const imgW = width;
          const imgH = height;
          ctx.drawImage(cachedImg, -imgW / 2, -imgH / 2, imgW, imgH);
        } else {
          // Placeholder gradient
          const grad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
          grad.addColorStop(0, '#3b82f6');
          grad.addColorStop(1, '#ec4899');
          ctx.fillStyle = grad;
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(clip.name || 'Loading Media...', 0, 0);
        }
      } else if (clip.type === 'text' && clip.text) {
        const textStr = clip.text;
        const fontSize = (clip.fontSize || 36) * (width / 960);
        ctx.font = `${clip.fontWeight || 'bold'} ${fontSize}px ${clip.fontFamily || 'sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Background pill/box if specified
        if (clip.backgroundColor) {
          const metrics = ctx.measureText(textStr);
          const boxW = metrics.width + 36;
          const boxH = fontSize * 1.5;
          ctx.fillStyle = clip.backgroundColor;
          ctx.beginPath();
          ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 12);
          ctx.fill();
        }

        // Text glow / shadow
        ctx.shadowColor = clip.color || '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.fillStyle = clip.color || '#ffffff';
        ctx.fillText(textStr, 0, 0);
        ctx.shadowBlur = 0;
      }

      // Draw bounding box if clip is selected
      if (selectedClipId === clip.id) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(-160, -50, 320, 100);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });

    // 4. Render Particle Simulation Layer
    if (activeParticlePreset !== 'none') {
      // Spawn particles
      if (particlesRef.current.length < 50) {
        for (let i = 0; i < 4; i++) {
          let pColor = '#ffffff';
          let vy = -1.5;
          let vx = (Math.random() - 0.5) * 1.5;
          let size = Math.random() * 3 + 1.5;

          if (activeParticlePreset === 'fire-embers') {
            pColor = Math.random() > 0.5 ? '#f97316' : '#ef4444';
            vy = -(Math.random() * 2 + 1);
            size = Math.random() * 4 + 2;
          } else if (activeParticlePreset === 'electric-sparks') {
            pColor = Math.random() > 0.5 ? '#38bdf8' : '#e879f9';
            vx = (Math.random() - 0.5) * 4;
            vy = (Math.random() - 0.5) * 4;
          } else if (activeParticlePreset === 'bokeh-orbs') {
            pColor = 'rgba(251, 191, 36, 0.4)';
            size = Math.random() * 18 + 8;
            vy = -(Math.random() * 0.8 + 0.2);
          } else if (activeParticlePreset === 'confetti') {
            const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
            pColor = colors[Math.floor(Math.random() * colors.length)];
            vy = Math.random() * 2 + 1;
          }

          particlesRef.current.push({
            x: Math.random() * width,
            y: activeParticlePreset === 'confetti' ? 0 : height + 10,
            vx,
            vy,
            size,
            alpha: 1,
            color: pColor,
            life: 0,
            maxLife: Math.random() * 90 + 40,
          });
        }
      }

      // Draw & update particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Cull dead particles
      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);
    } else {
      particlesRef.current = [];
    }

    // 5. Apply Color Grade Filter Overlay
    if (activeFilterPreset !== 'none') {
      ctx.save();
      switch (activeFilterPreset) {
        case 'cinematic-teal-orange': {
          ctx.globalCompositeOperation = 'color';
          ctx.fillStyle = 'rgba(14, 116, 144, 0.15)'; // teal
          ctx.fillRect(0, 0, width, height);
          ctx.globalCompositeOperation = 'soft-light';
          ctx.fillStyle = 'rgba(234, 88, 12, 0.2)'; // warm orange
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case 'cyberpunk-neon': {
          ctx.globalCompositeOperation = 'overlay';
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 0.2)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case 'vintage-70s': {
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = 'rgba(180, 83, 9, 0.25)';
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case 'noir-bw': {
          ctx.globalCompositeOperation = 'saturation';
          ctx.fillStyle = 'rgba(0, 0, 0, 1)';
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case 'golden-hour': {
          ctx.globalCompositeOperation = 'soft-light';
          ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case 'matrix-emerald': {
          ctx.globalCompositeOperation = 'color';
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.fillRect(0, 0, width, height);
          break;
        }
      }
      ctx.restore();
    }
  }, [currentTime, project, dimensions, selectedClipId, soundEnabled]);

  // Click on canvas to select clip
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const activeClips = project.clips.filter(
      (clip) => currentTime >= clip.startTime && currentTime <= clip.startTime + clip.duration
    );

    // Find closest clip near click
    const clickedClip = activeClips.find(
      (clip) => Math.abs(clip.x - clickX) < 25 && Math.abs(clip.y - clickY) < 20
    );

    onSelectClip(clickedClip ? clickedClip.id : null);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* Canvas Viewport Box */}
      <div
        className="relative rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/5 ring-1 ring-slate-800 bg-black flex items-center justify-center"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-crosshair w-full h-full block"
        />

        {/* Live Canvas Overlay Controls */}
        <div className="absolute top-3 right-3 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/60 shadow-md">
          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Transition Audio' : 'Unmute Transition Audio'}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="btn-toggle-fullscreen"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Resolution Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-slate-700/60">
          {dimensions.width}×{dimensions.height} • {project.aspectRatio} • 60 FPS
        </div>
      </div>
    </div>
  );
};
