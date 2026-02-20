import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  X,
  ZoomIn,
  ZoomOut,
  Mic,
  MicOff,
  Target,
} from "lucide-react";
import { PitchPoint } from "../services/pitchExtractor";
import { PitchData, AyahTiming } from "../types";
import LivePitchGraph from "./LivePitchGraph";
import CombinedWaveformPitch from "./CombinedWaveformPitch";
import LiveHzDisplay from "./LiveHzDisplay";
import AyahTextDisplay from "./AyahTextDisplay";
import FullScreenAyahTextDisplay from "./FullScreenAyahTextDisplay";
import Countdown from "./Countdown";

interface FullScreenTrainingModeProps {
  isOpen: boolean;
  onClose: () => void;
  referencePitch: PitchData[];
  studentPitch: PitchPoint[];
  isRecording: boolean;
  isPlaying: boolean;
  currentTime: number;
  referenceDuration?: number;
  // Waveform removed - only pitch graph is displayed
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  // NEW: Enhanced controls
  playbackSpeed?: number;
  onPlaybackSpeedChange?: (speed: number) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  loopMode?: boolean;
  onLoopModeChange?: (enabled: boolean) => void;
  loopStart?: number;
  loopEnd?: number;
  onLoopRangeChange?: (start: number, end: number) => void;
  theme?: "dark" | "light" | "high-contrast";
  onThemeChange?: (theme: "dark" | "light" | "high-contrast") => void;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  showMetronome?: boolean;
  onMetronomeToggle?: (enabled: boolean) => void;
  showReferenceOverlay?: boolean;
  onReferenceOverlayToggle?: (enabled: boolean) => void;
  // Practice mode props
  isPracticeMode?: boolean;
  onPracticeStart?: () => void;
  onPracticeStop?: () => void;
  onPracticeRestart?: () => void;
  practiceTime?: number;
  practiceAttempts?: number;
  // Recorded student voice audio props
  practiceAudioUrl?: string | null;
  isPlayingPracticeAudio?: boolean;
  practiceAudioTime?: number; // Current playback time of practice audio
  practiceAudioDuration?: number; // Duration of practice audio
  onPlayPracticeAudio?: () => void;
  onPausePracticeAudio?: () => void;
  onStopPracticeAudio?: () => void;
  // Quran text display props
  ayatTiming?: AyahTiming[];
  onSeekToTime?: (time: number) => void;
  // Training markers props
  markers?: Array<{
    time: number;
    reason: string;
    severity: "low" | "medium" | "high";
  }>;
  // Waveform props
  referenceUrl?: string | null;
  studentBlob?: Blob | null;
}

const FullScreenTrainingMode: React.FC<FullScreenTrainingModeProps> = ({
  isOpen,
  onClose,
  referencePitch,
  studentPitch,
  isRecording,
  isPlaying,
  currentTime,
  referenceDuration = 0,
  onPlay,
  onPause,
  onStop,
  onRestart,
  playbackSpeed = 1.0,
  onPlaybackSpeedChange,
  volume = 1.0,
  onVolumeChange,
  loopMode = false,
  onLoopModeChange,
  loopStart,
  loopEnd,
  onLoopRangeChange,
  theme = "dark",
  onThemeChange,
  zoomLevel = 1.0,
  onZoomChange,
  showMetronome = false,
  onMetronomeToggle,
  showReferenceOverlay = true,
  onReferenceOverlayToggle,
  isPracticeMode = false,
  onPracticeStart,
  onPracticeStop,
  onPracticeRestart,
  practiceTime = 0,
  practiceAttempts = 0,
  practiceAudioUrl = null,
  isPlayingPracticeAudio = false,
  practiceAudioTime = 0,
  practiceAudioDuration = 0,
  onPlayPracticeAudio,
  onPausePracticeAudio,
  onStopPracticeAudio,
  ayatTiming = [],
  onSeekToTime,
  markers = [],
  referenceUrl,
  studentBlob,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPracticeStats, setShowPracticeStats] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  // Format time display
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercent =
    referenceDuration > 0 ? (currentTime / referenceDuration) * 100 : 0;

  // Calculate graph height for full-screen (maximized to use most of screen)
  const getGraphHeight = () => {
    if (typeof window !== "undefined") {
      const availableHeight = window.innerHeight - 280;
      return Math.max(400, Math.min(Math.floor(availableHeight * 0.75), Math.floor(window.innerHeight * 0.6)));
    }
    return 600;
  };

  const [graphHeight, setGraphHeight] = React.useState(getGraphHeight());

  // Update graph height on window resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setGraphHeight(getGraphHeight());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Force graph resize when fullscreen opens
  useEffect(() => {
    if (!isOpen) return;

    // Trigger resize after a brief delay to ensure layout is complete
    const timeoutId1 = setTimeout(() => {
      setGraphHeight(getGraphHeight());
      // Force window resize event to trigger canvas resize
      window.dispatchEvent(new Event("resize"));
    }, 50);

    const timeoutId2 = setTimeout(() => {
      setGraphHeight(getGraphHeight());
      window.dispatchEvent(new Event("resize"));
    }, 150);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [isOpen]);

  // Prevent body scroll when full-screen is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ENHANCEMENT: Enhanced keyboard shortcuts with accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts (unless in input field)
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (isPlaying) {
          onPause();
        } else {
          onPlay();
        }
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onRestart();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onStop();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        if (onZoomChange) {
          onZoomChange(Math.min(2.0, zoomLevel + 0.1));
        }
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        if (onZoomChange) {
          onZoomChange(Math.max(0.5, zoomLevel - 0.1));
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        // Seek backward 5 seconds (if supported)
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        // Seek forward 5 seconds (if supported)
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (onMetronomeToggle) {
          onMetronomeToggle(!showMetronome);
        }
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        if (onLoopModeChange) {
          onLoopModeChange(!loopMode);
        }
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (isPracticeMode && onPracticeStop) {
          onPracticeStop();
        } else if (!isPracticeMode && onPracticeStart) {
          onPracticeStart();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    isPlaying,
    onClose,
    onPlay,
    onPause,
    onStop,
    onRestart,
    zoomLevel,
    onZoomChange,
    showMetronome,
    onMetronomeToggle,
    loopMode,
    onLoopModeChange,
    isPracticeMode,
    onPracticeStart,
    onPracticeStop,
  ]);

  // Note: Wheel zoom is handled by LivePitchGraph component for consistency with regular mode

  if (!isOpen) return null;

  // ENHANCEMENT: Theme-based styling
  const themeClasses = {
    dark: {
      bg: "bg-slate-900",
      controlsBg: "bg-slate-800/90",
      border: "border-slate-700",
      text: "text-slate-300",
      textMuted: "text-slate-400",
    },
    light: {
      bg: "bg-gray-50",
      controlsBg: "bg-white/90",
      border: "border-gray-300",
      text: "text-gray-800",
      textMuted: "text-gray-600",
    },
    "high-contrast": {
      bg: "bg-black",
      controlsBg: "bg-gray-900/95",
      border: "border-white",
      text: "text-white",
      textMuted: "text-gray-300",
    },
  };

  const currentTheme = themeClasses[theme];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 ${currentTheme.bg} flex flex-col items-center justify-center`}
      style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      role='dialog'
      aria-modal='true'
      aria-label='Full-screen training mode'
    >
      {/* ENHANCEMENT: Top Right Controls - Theme, Practice Stats, and Zoom Status */}
      <div className='absolute top-2 right-2 z-10 flex items-center gap-2'>
        {/* Zoom Status Display */}
        {onZoomChange && (
          <div className={`px-3 py-1.5 rounded ${currentTheme.controlsBg} border ${currentTheme.border} ${currentTheme.text} text-sm font-medium backdrop-blur-sm`}>
            Zoom: {Math.round((zoomLevel || 1.0) * 100)}%
          </div>
        )}
        {/* Practice Statistics Toggle */}
        {isPracticeMode && practiceAttempts > 0 && (
          <button
            onClick={() => setShowPracticeStats(!showPracticeStats)}
            className={`px-2 py-1 rounded ${currentTheme.controlsBg} border ${currentTheme.border} ${currentTheme.text} text-xs hover:opacity-80 transition-opacity backdrop-blur-sm flex items-center gap-1`}
            title='Toggle practice statistics'
            aria-label='Toggle practice statistics'
          >
            <Target size={12} />
            Stats
          </button>
        )}

        {/* Theme Toggle */}
        {onThemeChange && (
          <button
            onClick={() => {
              const themes: ("dark" | "light" | "high-contrast")[] = [
                "dark",
                "light",
                "high-contrast",
              ];
              const currentIndex = themes.indexOf(
                theme as "dark" | "light" | "high-contrast"
              );
              const nextIndex = (currentIndex + 1) % themes.length;
              onThemeChange(themes[nextIndex]);
            }}
            className={`px-2 py-1 rounded ${currentTheme.controlsBg} border ${currentTheme.border} ${currentTheme.text} text-xs hover:opacity-80 transition-opacity backdrop-blur-sm`}
            title='Toggle theme'
            aria-label='Toggle theme'
          >
            Theme
          </button>
        )}
      </div>

      {/* Practice Statistics Panel */}
      {showPracticeStats && isPracticeMode && (
        <div
          className={`absolute top-12 right-2 ${currentTheme.controlsBg} border ${currentTheme.border} rounded-lg p-3 shadow-xl min-w-[200px] z-10 backdrop-blur-sm`}
        >
          <div className={`text-xs font-semibold ${currentTheme.text} mb-2`}>
            Practice Statistics
          </div>
          <div className={`space-y-1.5 text-xs ${currentTheme.textMuted}`}>
            <div className='flex justify-between'>
              <span>Attempts:</span>
              <span className={currentTheme.text}>{practiceAttempts}</span>
            </div>
            <div className='flex justify-between'>
              <span>Current Time:</span>
              <span className={currentTheme.text}>
                {formatTime(practiceTime)}
              </span>
            </div>
            {referenceDuration > 0 && (
              <div className='flex justify-between'>
                <span>Progress:</span>
                <span className={currentTheme.text}>
                  {Math.round((practiceTime / referenceDuration) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Pitch Graph Area - Optimized for exact fit */}
      <div className='flex-1 flex flex-col items-center justify-center w-full px-2 mt-8'>
        {/* ENHANCEMENT: Live Hz Display with Timeline - Smaller in full-screen */}
        <div className='mb-2 w-full max-w-[90%]'>
          <LiveHzDisplay
            pitchData={studentPitch}
            isFullScreen={true}
            currentTime={currentTime}
            referenceDuration={referenceDuration}
            progressPercent={progressPercent}
            formatTime={formatTime}
            theme={currentTheme}
          />
        </div>

        {/* Graph Container - Full width for exact fit */}
        <div
          className='w-full flex items-center justify-center'
          style={{ minHeight: `${graphHeight}px`, height: `${graphHeight}px` }}
          data-graph-area
        >
          <CombinedWaveformPitch
            referencePitch={referencePitch}
            studentPitch={studentPitch}
            isRecording={isRecording}
            isPlaying={isPlaying || isPlayingPracticeAudio}
            currentTime={
              isPlayingPracticeAudio && practiceAudioTime > 0
                ? practiceAudioTime
                : currentTime
            }
            referenceDuration={referenceDuration}
            referenceAudioUrl={referenceUrl}
            studentAudioUrl={practiceAudioUrl}
            studentAudioBlob={studentBlob}
            onSeek={(progress) => {
              if (onSeekToTime && referenceDuration > 0) {
                onSeekToTime(progress * referenceDuration);
              }
            }}
            height={graphHeight}
            isFullScreen={true}
            markers={markers}
            onMarkerClick={(time) => {
              if (onSeekToTime) {
                onSeekToTime(time);
              }
            }}
            zoomLevel={zoomLevel}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Enhanced Quranic Text Display - Below Graph (Full-Screen Optimized) */}
        {ayatTiming && ayatTiming.length > 0 && referenceDuration > 0 && (
          <FullScreenAyahTextDisplay
            ayatTiming={ayatTiming}
            currentTime={currentTime}
            duration={referenceDuration}
            onSeek={(time) => {
              if (onSeekToTime) {
                onSeekToTime(time);
              }
            }}
            theme={currentTheme}
          />
        )}
      </div>

      <div
        className={`w-full ${currentTheme.controlsBg} border-t ${currentTheme.border} px-4 py-3 backdrop-blur-sm flex-shrink-0 z-10`}
      >
        <div className='flex items-center justify-center gap-3 flex-wrap min-h-[44px]'>
          {/* Practice Controls Group */}
          <div className='flex items-center gap-2'>
            {/* Practice Mode Toggle */}
            {onPracticeStart && onPracticeStop && (
              <button
                onClick={() => {
                  if (isPracticeMode) {
                    onPracticeStop();
                  } else {
                    // Show countdown before starting practice
                    setShowCountdown(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
                  isPracticeMode
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                } shadow-md hover:shadow-lg`}
                title={
                  isPracticeMode ? "Stop Practice (P)" : "Start Practice (P)"
                }
                aria-label={
                  isPracticeMode ? "Stop practice mode" : "Start practice mode"
                }
              >
                {isPracticeMode ? (
                  <>
                    <MicOff size={14} />
                    Stop Practice
                  </>
                ) : (
                  <>
                    <Mic size={14} />
                    Start Practice
                  </>
                )}
              </button>
            )}

            {/* Practice Mode Indicator */}
            {isPracticeMode && (
              <div className='flex items-center gap-1.5 px-2 py-1 rounded bg-red-600/20 border border-red-500/30'>
                <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
                <span className='text-xs text-red-300 font-medium'>
                  Recording
                </span>
              </div>
            )}

            {/* Practice Mode Controls */}
            {isPracticeMode && (
              <>
                {onPracticeStop && (
                  <button
                    onClick={onPracticeStop}
                    className='flex items-center justify-center w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400'
                    title='Stop Practice (S)'
                    aria-label='Stop practice'
                  >
                    <Square size={14} />
                  </button>
                )}
                {onPracticeRestart && (
                  <button
                    onClick={onPracticeRestart}
                    className='flex items-center justify-center w-9 h-9 rounded-full bg-slate-600 hover:bg-slate-700 text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400'
                    title='Restart Practice (R)'
                    aria-label='Restart practice'
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Divider */}
          {(isPracticeMode || practiceAudioUrl) && (
            <div className='h-8 w-px bg-slate-600/50'></div>
          )}

          {/* Recorded Student Voice Audio Controls */}
          {practiceAudioUrl && !isPracticeMode && (
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1 px-2 py-1 rounded bg-purple-600/20 border border-purple-500/30'>
                <span className='text-xs text-purple-300 font-medium'>
                  Your Recording
                </span>
              </div>
              {onPlayPracticeAudio && onPausePracticeAudio && (
                <button
                  onClick={
                    isPlayingPracticeAudio
                      ? onPausePracticeAudio
                      : onPlayPracticeAudio
                  }
                  className='flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1'
                  title={
                    isPlayingPracticeAudio
                      ? "Pause Recording"
                      : "Play Recording"
                  }
                  aria-label={
                    isPlayingPracticeAudio
                      ? "Pause recorded audio"
                      : "Play recorded audio"
                  }
                >
                  {isPlayingPracticeAudio ? (
                    <Pause size={18} className='ml-0.5' />
                  ) : (
                    <Play size={18} className='ml-1' />
                  )}
                </button>
              )}
              {onStopPracticeAudio && (
                <button
                  onClick={onStopPracticeAudio}
                  className='flex items-center justify-center w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400'
                  title='Stop Recording Playback'
                  aria-label='Stop recorded audio playback'
                >
                  <Square size={14} />
                </button>
              )}
            </div>
          )}

          {/* Divider for Reference Audio */}
          {referencePitch.length > 0 && (
            <div className='h-8 w-px bg-slate-600/50'></div>
          )}

          {/* Reference Audio Playback Controls - Always Available */}
          {referencePitch.length > 0 && (
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1 px-2 py-1 rounded bg-blue-600/20 border border-blue-500/30'>
                <span className='text-xs text-blue-300 font-medium'>
                  Reference
                </span>
              </div>
              {/* Play/Pause Button */}
              <button
                onClick={isPlaying ? onPause : onPlay}
                className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1'
                title={
                  isPlaying
                    ? "Pause Reference (Space)"
                    : "Play Reference (Space)"
                }
                aria-label={
                  isPlaying
                    ? "Pause reference playback"
                    : "Play reference playback"
                }
              >
                {isPlaying ? (
                  <Pause size={18} className='ml-0.5' />
                ) : (
                  <Play size={18} className='ml-1' />
                )}
              </button>

              {/* Stop Button */}
              <button
                onClick={onStop}
                className='flex items-center justify-center w-9 h-9 rounded-full bg-slate-600 hover:bg-slate-700 text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400'
                title='Stop Reference (S)'
                aria-label='Stop reference playback'
              >
                <Square size={14} />
              </button>

              {/* Restart Button */}
              <button
                onClick={onRestart}
                className='flex items-center justify-center w-9 h-9 rounded-full bg-slate-600 hover:bg-slate-700 text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400'
                title='Restart Reference (R)'
                aria-label='Restart reference from beginning'
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}

          {/* Exit Full-Screen Button */}
          <div className='ml-4 pl-4 border-l border-slate-600/50'>
            <button
              onClick={onClose}
              className='flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400'
              title='Exit Full-Screen (ESC)'
              aria-label='Exit full-screen mode'
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ENHANCEMENT: Enhanced Keyboard Shortcuts Hint - Improved */}
        <div
          className={`mt-2 pt-2 border-t border-slate-600/30 text-center text-[10px] ${currentTheme.textMuted} flex items-center justify-center gap-3 flex-wrap`}
        >
          <span className='flex items-center gap-1'>
            <kbd className='px-1.5 py-0.5 bg-slate-700/50 rounded text-[9px]'>
              Space
            </kbd>
            <span>Play/Pause</span>
          </span>
          <span className='flex items-center gap-1'>
            <kbd className='px-1.5 py-0.5 bg-slate-700/50 rounded text-[9px]'>
              R
            </kbd>
            <span>Restart</span>
          </span>
          <span className='flex items-center gap-1'>
            <kbd className='px-1.5 py-0.5 bg-slate-700/50 rounded text-[9px]'>
              S
            </kbd>
            <span>Stop</span>
          </span>
          {onPracticeStart && (
            <span className='flex items-center gap-1'>
              <kbd className='px-1.5 py-0.5 bg-slate-700/50 rounded text-[9px]'>
                P
              </kbd>
              <span>Practice</span>
            </span>
          )}
          {onZoomChange && (
            <span className='flex items-center gap-1'>
              <kbd className='px-1.5 py-0.5 bg-slate-700/50 rounded text-[9px]'>
                +/-
              </kbd>
              <span>Zoom</span>
            </span>
          )}
          <span className='flex items-center gap-1'>
            <kbd className='px-1.5 py-0.5 bg-slate-700/50 rounded text-[9px]'>
              ESC
            </kbd>
            <span>Exit</span>
          </span>
        </div>
      </div>

      {/* Countdown Overlay - Shows before practice mode starts */}
      <Countdown
        isActive={showCountdown}
        onComplete={() => {
          setShowCountdown(false);
          if (onPracticeStart) {
            onPracticeStart();
          }
        }}
        onCancel={() => {
          setShowCountdown(false);
        }}
        duration={5}
        showAudioCue={true}
      />
    </div>
  );
};

export default FullScreenTrainingMode;
