import React, { useState } from 'react';
import {
  X,
  Share2,
  HardDrive,
  Download,
  Video,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../types';
import { uploadToDrive } from '../services/driveService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  accessToken: string | null;
  onSignIn: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  accessToken,
  onSignIn,
}) => {
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUrl, setDriveUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.replace(/\s+/g, '_')}.motioncraft.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportToDrive = async () => {
    if (!accessToken) {
      onSignIn();
      return;
    }
    setIsUploadingToDrive(true);
    setError(null);
    setDriveUrl(null);

    try {
      const fileName = `${project.title.replace(/\s+/g, '_')}_MotionCraft.json`;
      const content = JSON.stringify(project, null, 2);

      const uploaded = await uploadToDrive(
        accessToken,
        fileName,
        'application/json',
        content
      );

      const link = uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;
      setDriveUrl(link);
    } catch (err: any) {
      setError(err.message || 'Failed to upload project to Google Drive');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-925">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Export & Share Project</h3>
              <p className="text-xs text-slate-400">Save your animations and transitions to Google Drive or local storage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Option 1: Direct Google Drive Upload */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Save to Google Drive</h4>
                  <p className="text-[11px] text-slate-400">Creates a cloud backup with direct shareable link</p>
                </div>
              </div>
            </div>

            {driveUrl ? (
              <div className="p-3 bg-emerald-950/80 rounded-lg border border-emerald-500/60 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Ready on Google Drive!</span>
                </div>
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1 transition"
                >
                  <span>Open Drive Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <button
                id="btn-export-to-drive-action"
                disabled={isUploadingToDrive}
                onClick={handleExportToDrive}
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
              >
                {isUploadingToDrive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HardDrive className="w-4 h-4" />
                )}
                <span>{isUploadingToDrive ? 'Uploading to Drive...' : 'Save to Google Drive Now'}</span>
              </button>
            )}
          </div>

          {/* Option 2: Download MotionCraft Project Bundle */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileJson className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Download Project (.json)</h4>
                <p className="text-[11px] text-slate-400">Export complete timeline, keyframes & animations</p>
              </div>
            </div>

            <button
              id="btn-download-json"
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
