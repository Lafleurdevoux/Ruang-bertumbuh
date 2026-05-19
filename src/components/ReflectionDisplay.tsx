import React from 'react';
import { motion } from 'motion/react';
import { MindfulnessResponse } from '../services/geminiService';
import { Wind, Heart, Zap, Coffee, Cloud, Sun, HelpCircle, UserX, AlertCircle, Clock } from 'lucide-react';

interface ReflectionDisplayProps {
  data: MindfulnessResponse | null;
}

const emotionIcons: Record<string, any> = {
  sedih: Cloud,
  marah: Zap,
  cemas: Wind,
  senang: Heart,
  lelah: Coffee,
  lega: Sun,
  bingung: HelpCircle,
  kesepian: UserX,
  bersyukur: Heart,
  tenang: Sun,
  netral: Coffee,
  penasaran: HelpCircle,
  kesal: Zap,
  kecewa: Cloud,
  hampa: Cloud,
  default: Heart
};

export const ReflectionDisplay: React.FC<ReflectionDisplayProps> = ({ data }) => {
  if (!data) return null;

  const isKrisis = data.kategori === 'F';
  const moodKey = data.mood.toLowerCase();
  const Icon = emotionIcons[moodKey] || emotionIcons.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-8 mt-12"
    >
      <div className={`glass p-8 rounded-3xl space-y-6 shadow-xl border border-gray-100 ${isKrisis ? 'border-red-500 bg-red-50' : ''}`}>
        {isKrisis && (
          <div className="flex items-center gap-2 text-red-600 bg-red-100/50 p-4 rounded-2xl mb-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider">Perhatian: Kamu Tidak Sendiri</p>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-green-light rounded-2xl border border-brand-green/20 shadow-sm">
            <Icon className="w-8 h-8 text-brand-green" />
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-widest text-brand-green font-sans font-black">Mood Terdeteksi</h3>
            <p className="text-3xl font-serif capitalize text-gray-900">{data.mood}</p>
          </div>
        </div>

        <blockquote className="text-2xl font-serif text-gray-800 italic leading-relaxed">
          "{data.respon}"
        </blockquote>
      </div>

      {data.tampilkan_mindfulness && data.aktivitas_mindfulness && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass p-8 rounded-3xl border border-brand-green/30 border-t-4 shadow-xl bg-brand-green-light"
        >
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-sm uppercase tracking-widest text-brand-green font-sans font-black">Aktivitas Mindfulness</h4>
            <div className="flex items-center gap-1.5 text-xs text-brand-green bg-white shadow-sm px-3 py-1.5 rounded-full font-bold">
              <Clock className="w-3.5 h-3.5" />
              {data.aktivitas_mindfulness.duration_minutes} Menit
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-serif text-gray-900">{data.aktivitas_mindfulness.title}</h2>
            <p className="font-serif italic text-gray-700 leading-relaxed whitespace-pre-line" style={{ fontSize: '24px' }}>
              {data.aktivitas_mindfulness.instruction}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
