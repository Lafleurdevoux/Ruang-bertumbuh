import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sprout } from 'lucide-react';
import { resolveStorageUrl } from '../services/firebaseService';

// Path to the meditation audio in Firebase Storage
const MEDITATION_GS_URL = 'gs://silent-sweep-433515-i7.firebasestorage.app/meditation_beginner_fix.mp3';

export function MeditationSection() {
  const meditationAudio = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    
    const handleCanPlay = () => setIsLoaded(true);
    const handleEnded = () => {
      setIsPlaying(false);
      if (audio) audio.currentTime = 0;
    };

    const initAudio = async () => {
      const url = await resolveStorageUrl(MEDITATION_GS_URL);
      if (!url) {
        console.error("Could not resolve meditation audio URL");
        return;
      }

      audio = new Audio(url);
      meditationAudio.current = audio;
      audio.preload = 'auto';
      
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('ended', handleEnded);
    };

    initAudio();
    
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('ended', handleEnded);
      }
      meditationAudio.current = null;
    };
  }, []);

  const handleLeafClick = () => {
    if (!meditationAudio.current) return;
    
    if (isPlaying) {
      meditationAudio.current.pause();
      setIsPlaying(false);
    } else {
      // Pause main music player
      window.dispatchEvent(new CustomEvent('pause-main-music'));
      
      meditationAudio.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Audio play failed:', err);
        });
    }
  };

  const hintText = isPlaying 
    ? "Sedang berlangsung... tekan untuk jeda"
    : (meditationAudio.current && meditationAudio.current.currentTime > 0)
      ? "Tekan daun untuk melanjutkan"
      : "Tekan daun untuk memulai";

  return (
    <section 
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden text-center"
      style={{ background: 'linear-gradient(160deg, #FAFAF7 0%, #EAF3DE 100%)' }}
      aria-label="Section meditasi"
    >
      <div className="z-10 flex flex-col items-center max-w-lg w-full">
        <h2 className="text-[27px] font-serif font-medium text-[#173404] mb-1.5">Meditasi</h2>
        <p className="text-[13px] italic text-[#3B6D11]/85 mb-10">Tarik napas, hadir di saat ini</p>
        
        {/* Pulse Circle centerpiece */}
        <div className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px] relative mb-8">
          {/* Layer 1 (outermost) */}
          <div className="absolute inset-0 bg-[#639922]/[0.08] rounded-full animate-calming-pulse" />
          
          {/* Layer 2 */}
          <div className="absolute inset-[18px] sm:inset-[20px] md:inset-[22px] bg-[#639922]/[0.14] rounded-full animate-calming-pulse [animation-delay:0.2s]" />
          
          {/* Layer 3 */}
          <div className="absolute inset-[36px] sm:inset-[40px] md:inset-[44px] bg-[#639922]/[0.22] rounded-full animate-calming-pulse [animation-delay:0.4s]" />
          
          {/* Core Button */}
          <button
            onClick={handleLeafClick}
            className="absolute inset-[54px] sm:inset-[60px] md:inset-[66px] bg-[#3B6D11] rounded-full flex items-center justify-center cursor-pointer border-none transition-all hover:scale-110 active:scale-95 animate-inner-core-pulse [animation-delay:0.6s] group focus:outline-none focus:ring-4 focus:ring-[#3B6D11]/40"
            aria-label={isPlaying ? "Jeda meditasi" : "Mulai meditasi"}
          >
            <motion.div
               animate={isPlaying ? { scale: [1, 1.08, 1], rotate: [0, 2, 0] } : {}}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="flex items-center justify-center"
            >
              <Sprout className="text-white w-8 h-8 md:w-9 md:h-9" />
            </motion.div>
          </button>
        </div>
        
        <p className="text-[12px] text-[#5F5E5A]/70 m-0 font-sans" aria-live="polite">
          {!isLoaded ? "Memuat..." : hintText}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: reduce) {
          .animate-calming-pulse,
          .animate-inner-core-pulse {
            animation: none !important;
          }
        }
      `}} />
    </section>
  );
}
