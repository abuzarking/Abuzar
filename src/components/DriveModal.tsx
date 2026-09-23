import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  ExternalLink,
  Upload,
  RefreshCw,
  Search,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { listDriveFiles, uploadToDrive, deleteDriveFile } from '../services/driveService';
import { DriveFile, Project, Clip } from '../types';

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  onSignIn: () => void;
  project: Project;
  onAddClipToTimeline: (clip: Partial<Clip>) => void;
}

export const DriveModal: React.FC<DriveModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  onSignIn,
  project,
  onAddClipToTimeline,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'media' | 'projects'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadingProject, setUploadingProject] = useState(false);
  const [lastUploadedLink, setLastUploadedLink] = useState<{ name: string; url: string } | null>(null);

  // Destructive delete confirmation state (Mandatory per Google Workspace Skill)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && accessToken) {
      loadFiles();
    }
  }, [isOpen, accessToken, filter]);

  const loadFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listDriveFiles(accessToken, filter, searchQuery);
      setFiles(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch files from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportProjectToDrive = async () => {
    if (!accessToken) {
      onSignIn();
      return;
    }
    setUploadingProject(true);
    setError(null);
    try {
      const fileName = `${project.title.replace(/\s+/g, '_')}_${Date.now()}.motioncraft.json`;
      const projectData = JSON.stringify(project, null, 2);

      const uploaded = await uploadToDrive(
        accessToken,
        fileName,
        'application/json',
        projectData
      );

      const link = uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;
      setLastUploadedLink({ name: fileName, url: link });
      await loadFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to save project to Google Drive');
    } finally {
      setUploadingProject(false);
    }
  };

  const handleDeleteWithConfirmation = async (fileId: string) => {
    if (!accessToken) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDriveFile(accessToken, fileId);
      setConfirmDeleteId(null);
      await loadFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete file from Google Drive');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInsertDriveMedia = (file: DriveFile) => {
    const isImage = file.mimeType.startsWith('image/');
    const isVideo = file.mimeType.startsWith('video/');

    onAddClipToTimeline({
      type: isVideo ? 'video' : 'image',
      name: file.name,
      src: file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s1200') : undefined,
      duration: 5,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 1,
      entranceAnimation: 'slide-up',
      continuousAnimation: 'glow-breathe',
      exitAnimation: 'none',
      transitionIn: 'cube-rotate',
      transitionDuration: 0.8,
      filter: 'cinematic-teal-orange',
      particleEffect: 'sparkles',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-925">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Google Drive Studio Hub</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Cloud Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">Browse Drive assets, import into timeline, or export project</p>
            </div>
          </div>

          <button
            id="btn-close-drive-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* If NOT Authenticated */}
          {!accessToken ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">Connect Your Google Drive</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Access your photos, videos, animations, and save your MotionCraft projects directly to your personal Google Drive.
                </p>
              </div>
              <button
                id="btn-drive-modal-sign-in"
                onClick={onSignIn}
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-900 px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-white/10"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            <>
              {/* Export Project Card */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Project to Google Drive</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Save "{project.title}" ({project.clips.length} layers & transitions) directly to your cloud storage
                  </p>
                </div>

                <button
                  id="btn-upload-project-drive"
                  disabled={uploadingProject}
                  onClick={handleExportProjectToDrive}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shrink-0 shadow-md shadow-emerald-500/20"
                >
                  {uploadingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                  <span>{uploadingProject ? 'Saving to Drive...' : 'Save to Drive'}</span>
                </button>
              </div>

              {/* Direct Drive Link notification banner if just uploaded */}
              {lastUploadedLink && (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg shadow-emerald-500/10 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white">Project successfully saved to Google Drive!</p>
                      <p className="text-[11px] text-emerald-300 font-mono mt-0.5">{lastUploadedLink.name}</p>
                    </div>
                  </div>
                  <a
                    id="link-view-in-google-drive"
                    href={lastUploadedLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shrink-0 shadow-sm"
                  >
                    <span>Open in Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                      placeholder="Search files in Drive..."
                      className="w-full bg-slate-950 border border-slate-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={loadFiles}
                    title="Refresh Files"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      filter === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Files
                  </button>
                  <button
                    onClick={() => setFilter('media')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      filter === 'media' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Media (Images/Video)
                  </button>
                  <button
                    onClick={() => setFilter('projects')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      filter === 'projects' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Projects (.json)
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* File List */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800/50">
                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span>Loading your Google Drive files...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    No files found in this view.
                  </div>
                ) : (
                  files.map((file) => {
                    const isMedia = file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/');
                    const isConfirming = confirmDeleteId === file.id;

                    return (
                      <div
                        key={file.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-900/60 transition group"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                            {file.mimeType.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 text-cyan-400" />
                            ) : file.mimeType.startsWith('video/') ? (
                              <Film className="w-4 h-4 text-pink-400" />
                            ) : (
                              <FileText className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{file.mimeType}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {/* Mandatory confirmation before deleting as required by Skill */}
                          {isConfirming ? (
                            <div className="flex items-center space-x-1.5 bg-rose-950/80 p-1 rounded-lg border border-rose-600">
                              <span className="text-[10px] text-rose-300 font-bold px-1">Delete?</span>
                              <button
                                onClick={() => handleDeleteWithConfirmation(file.id)}
                                disabled={isDeleting}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                              >
                                {isDeleting ? '...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              {isMedia && (
                                <button
                                  onClick={() => handleInsertDriveMedia(file)}
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center space-x-1 transition"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>To Timeline</span>
                                </button>
                              )}

                              {/* Direct Google Drive Link */}
                              <a
                                href={file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open file in Google Drive"
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition flex items-center"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              {/* Delete button (triggers confirmation) */}
                              <button
                                onClick={() => setConfirmDeleteId(file.id)}
                                title="Delete file from Google Drive"
                                className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
