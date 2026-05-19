import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Music, SkipBack, Play, Pause, SkipForward, Volume2, VolumeX, Repeat as RepeatIcon, Repeat1 } from 'lucide-react';
import { resolveStorageUrl } from '../services/firebaseService';

const PLAYLIST = [
  { name: "Forest",     url: "gs://silent-sweep-433515-i7.firebasestorage.app/Music/forest.mp3" },
  { name: "Happy",      url: "gs://silent-sweep-433515-i7.firebasestorage.app/Music/Happy.mp3" },
  { name: "Jazz",       url: "gs://silent-sweep-433515-i7.firebasestorage.app/Music/jazz.mp3" },
  { name: "Meditation", url: "gs://silent-sweep-433515-i7.firebasestorage.app/Music/Meditation.mp3" },
  { name: "Ocean",      url: "gs://silent-sweep-433515-i7.firebasestorage.app/Music/Ocean.mp3" },
  { name: "Piano",      url: "gs://silent-sweep-433515-i7.firebasestorage.app/Music/Piano.mp3" },
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(65);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [resolvedUrls, setResolvedUrls] = useState<string[]>(new Array(PLAYLIST.length).fill(''));
  const [isMuted, setIsMuted] = useState(false);
  const prevVolume = useRef(65);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Resolve URLs
  useEffect(() => {
    const resolveAll = async () => {
      const urls = await Promise.all(PLAYLIST.map(track => resolveStorageUrl(track.url)));
      setResolvedUrls(urls.map(url => url || ''));
    };
    resolveAll();
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Sync track
  useEffect(() => {
    if (!audioRef.current || !resolvedUrls[currentTrackIndex]) return;
    
    const wasPlaying = isPlaying;
    audioRef.current.src = resolvedUrls[currentTrackIndex];
    if (wasPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Autoplay rejected or error:", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex, resolvedUrls]);

  // Global pause listener
  useEffect(() => {
    const handleGlobalPause = () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener('pause-main-music', handleGlobalPause);
    return () => window.removeEventListener('pause-main-music', handleGlobalPause);
  }, [isPlaying]);

  // Handle Ended & Error events
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (repeatMode === 'all') {
        setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
      } else {
        if (currentTrackIndex === PLAYLIST.length - 1) {
          setIsPlaying(false);
        } else {
          setCurrentTrackIndex((prev) => prev + 1);
        }
      }
    };

    const onError = () => {
      console.error(`Failed to load song: ${PLAYLIST[currentTrackIndex].name} @ ${PLAYLIST[currentTrackIndex].url}`);
      // Skip to next
      setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [repeatMode, currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Play failed:", err);
      });
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const cycleRepeatMode = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    setRepeatMode(modes[nextIdx]);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume.current);
      setIsMuted(false);
    } else {
      prevVolume.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="w-full bg-white border border-[#E5E7EB] rounded-[12px] h-auto min-h-[80px] sm:h-[90px] mb-4 flex items-center justify-between px-5 py-4 shadow-sm overflow-hidden flex-wrap md:flex-nowrap gap-4 md:gap-0">
      
      {/* LEFT: ALBUM ICON + TRACK SELECTOR */}
      <div className="flex items-center">
        {/* 1. ALBUM ICON */}
        <div className="flex-shrink-0 mr-5">
          <div className="w-[56px] h-[56px] bg-[#EAF3DE] rounded-[8px] flex items-center justify-center relative">
            <motion.div
              animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Music size={26} className="text-[#3B6D11]" />
            </motion.div>
            {isPlaying && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#3B6D11] rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
        </div>

        {/* 2. TRACK SELECTOR + INFO */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <select
            value={currentTrackIndex}
            onChange={(e) => setCurrentTrackIndex(parseInt(e.target.value))}
            className="bg-transparent border border-gray-200 rounded px-2 py-1 text-[14px] font-[500] text-gray-800 focus:outline-none focus:border-[#3B6D11] cursor-pointer max-w-[200px]"
          >
            {PLAYLIST.map((track, idx) => (
              <option key={idx} value={idx}>{track.name}</option>
            ))}
          </select>
          <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">
            Track {currentTrackIndex + 1} of {PLAYLIST.length} · Repeat {repeatMode}
          </span>
        </div>
      </div>

      {/* 3. CONTROLS (MIDDLE) */}
      <div className="flex items-center justify-center gap-2">
        <button 
          onClick={prevTrack}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Previous"
        >
          <SkipBack size={20} fill="currentColor" className="opacity-40" />
        </button>
        
        <button 
          onClick={togglePlay}
          className="w-11 h-11 bg-[#3B6D11] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>

        <button 
          onClick={nextTrack}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Next"
        >
          <SkipForward size={20} fill="currentColor" className="opacity-40" />
        </button>

        <button 
          onClick={cycleRepeatMode}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            repeatMode !== 'off' ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'text-gray-400 hover:bg-gray-50'
          }`}
          aria-label={`Repeat ${repeatMode}`}
        >
          {repeatMode === 'one' ? <Repeat1 size={20} /> : <RepeatIcon size={20} />}
        </button>
      </div>

      {/* 4. VOLUME (RIGHT) */}
      <div className="flex items-center gap-3 w-full md:w-[160px] flex-shrink-0">
        <button onClick={toggleMute} className="text-gray-400 hover:text-[#3B6D11] transition-colors">
          {(isMuted || volume === 0) ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div className="flex-1 h-[3px] bg-gray-100 rounded-full relative cursor-pointer group">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setVolume(val);
              if (val > 0) setIsMuted(false);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute left-0 top-0 h-full bg-[#3B6D11] rounded-full" 
            style={{ width: `${volume}%` }} 
          />
          <div 
            className="absolute w-[10px] h-[10px] bg-[#3B6D11] rounded-full border border-white shadow-sm -mt-[3.5px]" 
            style={{ left: `calc(${volume}% - 5px)` }} 
          />
        </div>
      </div>

    </div>
  );
}
