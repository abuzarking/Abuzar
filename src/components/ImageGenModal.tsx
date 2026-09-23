import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  HardDrive,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tv,
  Smartphone,
  Square,
} from 'lucide-react';
import { generateHighQualityImage } from '../services/geminiService';
import { uploadToDrive } from '../services/driveService';
import { Clip } from '../types';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClipToTimeline: (clip: Partial<Clip>) => void;
  accessToken: string | null;
  onRequireAuth: () => void;
}

const PROMPT_SUGGESTIONS = [
  'A neon-lit cyberpunk city at night with flying vehicles and glowing holographic billboards, 8k render, octane render style',
  'Cinematic shot of misty alpine pine mountains during golden hour sunrise, volumetric sunlight beams',
  'Futuristic holographic AI core orb floating with glowing electric circuits, cinematic sci-fi concept art',
  'Retro 1980s synthwave sunset highway with purple wireframe grid and neon sun',
];

export const ImageGenModal: React.FC<ImageGenModalProps> = ({
  isOpen,
  onClose,
  onAddClipToTimeline,
  accessToken,
  onRequireAuth,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  // Mandated image size affordance: 1K, 2K, and 4K
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setDriveUploadSuccess(null);

    try {
      const data = await generateHighQualityImage(prompt, aspectRatio, imageSize);
      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      console.error('Image gen error:', err);
      setError(err.message || 'Failed to generate image. Please check API key configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToTimeline = () => {
    if (!generatedImage) return;

    onAddClipToTimeline({
      type: 'image',
      name: `AI Image (${imageSize})`,
      src: generatedImage,
      duration: 4.5,
      scale: 1,
      x: 50,
      y: 50,
      rotation: 0,
      opacity: 1,
      entranceAnimation: 'kinetic-scale',
      continuousAnimation: 'float',
      exitAnimation: 'none',
      transitionIn: 'wipe-right',
      transitionDuration: 0.8,
      filter: 'none',
      particleEffect: 'sparkles',
    });

    onClose();
  };

  const handleSaveToDrive = async () => {
    if (!generatedImage) return;
    if (!accessToken) {
      onRequireAuth();
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      // Convert base64 data url to Blob
      const base64Data = generatedImage.split(',')[1];
      const binary = atob(base64Data);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: 'image/png' });

      const fileName = `MotionCraft_AI_${Date.now()}_${imageSize}.png`;
      const uploadedFile = await uploadToDrive(accessToken, fileName, 'image/png', blob);

      setDriveUploadSuccess(
        uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to upload to Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-925">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>AI Image Generator</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  gemini-3-pro-image-preview
                </span>
              </h3>
              <p className="text-xs text-slate-400">Generate stunning 1K, 2K, and 4K media for your timeline</p>
            </div>
          </div>

          <button
            id="btn-close-image-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Prompt input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200">Creative Visual Prompt</label>
            <textarea
              id="textarea-image-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate in detail..."
              className="w-full bg-slate-950 border border-slate-750 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 placeholder-slate-500 resize-none"
            />
          </div>

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(s)}
                className="text-[10px] bg-slate-800/80 hover:bg-slate-750 text-slate-300 px-2 py-1 rounded-lg border border-slate-700/60 truncate max-w-[280px] transition"
              >
                💡 {s}
              </button>
            ))}
          </div>

          {/* Affordances: Image Size (1K, 2K, 4K) & Aspect Ratio */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {/* Resolution Size Affordance (1K, 2K, 4K) as required */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Resolution Quality</span>
                <span className="text-[10px] text-pink-400 font-mono">Affordance</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['1K', '2K', '4K'] as const).map((size) => (
                  <button
                    key={size}
                    id={`btn-size-${size}`}
                    onClick={() => setImageSize(size)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      imageSize === size
                        ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white border-pink-400 shadow-md shadow-pink-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition flex items-center justify-center space-x-1 ${
                    aspectRatio === '16:9'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Tv className="w-3 h-3" />
                  <span>16:9</span>
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition flex items-center justify-center space-x-1 ${
                    aspectRatio === '9:16'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>9:16</span>
                </button>
                <button
                  onClick={() => setAspectRatio('1:1')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition flex items-center justify-center space-x-1 ${
                    aspectRatio === '1:1'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Square className="w-3 h-3" />
                  <span>1:1</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            id="btn-trigger-image-generate"
            disabled={isGenerating || !prompt.trim()}
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-pink-500/25"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {imageSize} Image with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate High-Quality {imageSize} Image</span>
              </>
            )}
          </button>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedImage && (
            <div className="space-y-3 pt-2">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center group">
                <img
                  src={generatedImage}
                  alt="Generated by Gemini"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-slate-700">
                  {imageSize} • {aspectRatio}
                </div>
              </div>

              {/* Upload to Google Drive Feedback */}
              {driveUploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Saved directly to your Google Drive!</span>
                  </div>
                  <a
                    href={driveUploadSuccess}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline text-white hover:text-emerald-200"
                  >
                    Open in Drive ↗
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-add-image-to-timeline"
                  onClick={handleAddToTimeline}
                  className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-cyan-500/20"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Insert into Timeline</span>
                </button>

                <button
                  id="btn-save-image-to-drive"
                  disabled={isUploading}
                  onClick={handleSaveToDrive}
                  className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Save to Google Drive</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
