import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioRecorderProps {
  onRecordingComplete: (base64: string, mimeType: string) => void;
  isProcessing: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          onRecordingComplete(base64data, mediaRecorder.mimeType);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Gagal mengakses mikropon. Pastikan izin sudah diberikan.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {!isRecording ? (
          <motion.button
            key="start"
            id="start-recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={startRecording}
            disabled={isProcessing}
            className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center hover:bg-brand-green/80 transition-colors disabled:opacity-50 group relative"
          >
            {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Mic className="w-8 h-8" />}
            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-sans whitespace-nowrap text-gray-500 font-bold">
              Ketuk untuk bercerita
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-xl font-mono text-red-600 font-bold animate-pulse">{formatTime(recordingTime)}</div>
            <button
              id="stop-recording"
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg shadow-red-100"
            >
              <Square className="w-8 h-8 text-white" />
            </button>
            <div className="text-xs font-sans text-gray-500 font-medium">Sedang mendengarkan...</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
