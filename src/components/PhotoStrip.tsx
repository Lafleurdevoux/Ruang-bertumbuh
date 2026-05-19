import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StoredReflection } from '../services/firebaseService';
import { PhotoDetailModal } from './PhotoDetailModal';

interface PhotoStripProps {
  reflections: StoredReflection[];
  onDelete?: (id: string) => void;
}

const MOOD_CONFIGS: Record<string, { bg: string; text: string }> = {
  'SENANG': { bg: '#FAC775', text: '#633806' },
  'TENANG': { bg: '#C0DD97', text: '#27500A' },
  'SEDIH': { bg: '#CECBF6', text: '#26215C' },
  'CEMAS': { bg: '#F5C4B3', text: '#712B13' },
  'LELAH': { bg: '#B5D4F4', text: '#042C53' },
  'MARAH': { bg: '#F09595', text: '#501313' },
  'KESEPIAN': { bg: '#AFA9EC', text: '#26215C' },
  'BERSYUKUR': { bg: '#97C459', text: '#173404' },
};

const getMoodConfig = (emotion?: string) => {
  if (!emotion) return MOOD_CONFIGS['TENANG'];
  const upper = emotion.toUpperCase();
  return MOOD_CONFIGS[upper] || MOOD_CONFIGS['TENANG'];
};

export const PhotoStrip: React.FC<PhotoStripProps> = ({ reflections, onDelete }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<StoredReflection | null>(null);
  const photoReflections = reflections.filter(r => r.photoUrl);

  if (photoReflections.length === 0) return null;

  const shouldScroll = photoReflections.length >= 3;
  const displayPhotos = shouldScroll 
    ? [...photoReflections, ...photoReflections, ...photoReflections, ...photoReflections] 
    : photoReflections;

  return (
    <div className="w-full bg-[#f3f7ee] py-12 rounded-[40px] px-8 sm:px-12 mb-8 select-none group/strip">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#6da85d] tracking-[0.3em] font-bold" style={{ fontSize: '14.588235px' }}>● GALERI JURNAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C2C2A] leading-tight">
            Kenangan <span className="italic text-[#6da85d]">kecil</span> minggu ini
          </h2>
        </div>
      </div>

      <div 
        className="flex overflow-hidden relative p-4 -m-4"
      >
        <div 
          className={`flex gap-[28px] ${shouldScroll ? 'animate-[scrollLeft_60s_linear_infinite] group-hover/strip:[animation-play-state:paused]' : 'justify-center w-full'}`}
          style={{ width: shouldScroll ? 'max-content' : '100%' }}
        >
          {displayPhotos.map((ref, idx) => {
            const config = getMoodConfig(ref.emotion);
            // Stable rotation based on index
            const rotation = ((idx % 7) - 3);
            
            return (
              <motion.div
                key={`${ref.id}-${idx}`}
                whileHover={{ rotate: 0, y: -6, transition: { duration: 0.3 } }}
                onClick={() => setSelectedPhoto(ref)}
                className="relative flex-shrink-0 w-[240px] sm:w-[280px] bg-[#FFFEFB] border-2 border-[#2C2C2A] p-[22px] pb-[18px] rounded-sm cursor-pointer transition-all duration-300"
                style={{ 
                  rotate: `${rotation}deg`,
                  boxShadow: '4px 5px 0 #2C2C2A'
                }}
              >
              {/* Washi Tape */}
              <div 
                className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-[90px] h-[26px] opacity-[0.82] z-10"
                style={{ 
                  backgroundColor: config.bg,
                  rotate: `${(idx % 11) - 5}deg`,
                  clipPath: 'polygon(0% 15%, 10% 0%, 90% 0%, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 85%)' // Ripped edges look
                }}
              />
              
              {/* Photo */}
              <div className="aspect-[3/4] border-2 border-[#2C2C2A] overflow-hidden mb-4">
                <img 
                  src={ref.photoUrl} 
                  alt="Memory" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-serif italic text-[#2C2C2A] text-lg">
                  {ref.timestamp?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
                  style={{ backgroundColor: config.bg, color: config.text }}
                >
                  {ref.emotion}
                </span>
              </div>
            </motion.div>
          );
        })}
        </div>
      </div>

      <PhotoDetailModal 
        reflection={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
        onDelete={onDelete}
      />
    </div>
  );
};

