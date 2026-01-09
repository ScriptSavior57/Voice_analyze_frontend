import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, RotateCcw } from "lucide-react";
import { RealTimePitchExtractor, PitchPoint } from "../services/pitchExtractor";
import { PitchData } from "../types";

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onPitchUpdate?: (pitch: PitchPoint) => void; // Real-time pitch callback
  onRecordingStart?: () => void; // Reset callback
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  // Props for pitch graph view
  recordingPitchData?: PitchPoint[]; // Current recording pitch data
  referencePitchData?: PitchData[]; // Reference pitch for comparison
  referenceDuration?: number; // Reference audio duration
  viewMode?: "waveform" | "pitch"; // Display mode
}

const Recorder: React.FC<RecorderProps> = ({
  onRecordingComplete,
  onPitchUpdate,
  onRecordingStart,
  isRecording,
  setIsRecording,
  recordingPitchData = [],
  referencePitchData = [],
  referenceDuration = 0,
  viewMode = "pitch", // Default to pitch view
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const pitchExtractorRef = useRef<RealTimePitchExtractor | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      // Reset callback (clears state for recording)
      if (onRecordingStart) {
        onRecordingStart();
      }

      // Get microphone stream for recording with balanced settings
      // Enabled noiseSuppression and autoGainControl for clear, audible recordings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true, // Keep for feedback prevention
          noiseSuppression: true, // ENABLED - improves voice clarity
          autoGainControl: true, // ENABLED - boosts quiet audio (not filtering, just volume adjustment)
          sampleRate: 44100, // Keep high quality
          channelCount: 1, // Mono
        },
      });
      streamRef.current = stream;

      // Try to use best available codec
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // Higher bitrate for better quality
      });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      // Start real-time pitch extraction for recording
      // This is separate from practice mode - recording has its own pitch extraction
      if (onPitchUpdate) {
        const extractor = new RealTimePitchExtractor();
        pitchExtractorRef.current = extractor;
        // Apply NO filtering for raw voice capture
        await extractor.startFromStream(stream, onPitchUpdate, {
          minHz: 0, // No minimum - capture all frequencies
          maxHz: Infinity, // No maximum - capture all frequencies
          minConfidence: 0.0, // No confidence threshold - capture everything
          smoothingWindow: 1, // No smoothing - raw data only
          enabled: false, // DISABLED - no filtering at all
        });
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
          console.log("Recording chunk received:", e.data.size, "bytes");
        }
      };

      mediaRecorder.onstop = () => {
        console.log("Recording stopped, chunks:", chunks.length);
        if (chunks.length > 0) {
          const blob = new Blob(chunks, {
            type: mediaRecorder.mimeType || "audio/webm",
          });
          console.log(
            "Recording blob created:",
            blob.size,
            "bytes",
            "Type:",
            blob.type
          );
          onRecordingComplete(blob);
        } else {
          console.warn("No audio chunks collected during recording");
          alert("No audio was recorded. Please try again.");
        }

        // Stop pitch extraction
        if (pitchExtractorRef.current) {
          pitchExtractorRef.current.stop();
          pitchExtractorRef.current = null;
        }

        stream.getTracks().forEach((track) => track.stop()); // Stop mic
      };

      mediaRecorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        alert("Audio recording error occurred. Please try again.");
      };

      // Start with timeslice to ensure regular data collection
      mediaRecorder.start(100); // 100ms timeslice
      console.log("Recording started, state:", mediaRecorder.state);
      setIsRecording(true);
      setTimer(0);

      timerIntervalRef.current = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop pitch extraction
      if (pitchExtractorRef.current) {
        pitchExtractorRef.current.stop();
        pitchExtractorRef.current = null;
      }

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pitchExtractorRef.current) {
        pitchExtractorRef.current.stop();
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className='flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl transition-all'>
      <div className='text-3xl font-mono text-slate-700 mb-4 font-bold'>
        {formatTime(timer)}
      </div>

      {!isRecording ? (
        <button
          onClick={startRecording}
          className='flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg font-semibold shadow-lg transition-transform transform hover:scale-105'
        >
          <Mic className='w-6 h-6' />
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className='flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-lg font-semibold shadow-lg animate-pulse'
        >
          <Square className='w-6 h-6 fill-current' />
          Stop Recording
        </button>
      )}

      <p className='mt-4 text-sm text-slate-500'>
        {isRecording
          ? "Recording in progress..."
          : "Click start to mimic the reference recitation"}
      </p>

      {/* REMOVED: Duplicate graph - using main Pitch Comparison Graph in TrainingStudio instead */}
    </div>
  );
};

export default Recorder;
