import React from 'react';
import { motion } from 'motion/react';
import { StrengthSpotterResponse } from '../services/geminiService';
import { Award, Mail, TrendingUp, Type } from 'lucide-react';

interface StrengthSpotterDisplayProps {
  data: StrengthSpotterResponse | null;
}

export const StrengthSpotterDisplay: React.FC<StrengthSpotterDisplayProps> = ({ data }) => {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto space-y-8 mt-12"
    >
      <div className="glass p-8 rounded-3xl space-y-6 border-brand-green/20 border shadow-xl bg-white/40">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-green-light rounded-2xl border border-brand-green/20 shadow-sm">
            <Award className="w-8 h-8 text-brand-green" />
          </div>
          <div>
            <h3 className="text-xs tracking-widest text-brand-green font-sans font-black">Nilai utamamu</h3>
            <p className="text-xl font-serif text-gray-900">Nilai Inti yang Terpancar</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {data.core_values.map((value, i) => (
            <motion.span
              key={value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="px-4 py-2 bg-brand-green-light border border-brand-green/20 rounded-full text-brand-green text-sm font-bold shadow-sm"
            >
              {value}
            </motion.span>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl border-brand-green/20 border-2 overflow-hidden shadow-2xl bg-white/60"
      >
        <div className="bg-[#dceee0] px-8 py-4 flex items-center gap-3 border-b border-brand-green/10">
          <Mail className="w-5 h-5 text-brand-green" />
          <h4 className="text-sm tracking-widest text-brand-green font-sans font-black">Surat apresiasi untukmu</h4>
        </div>
        
        <div className="p-8 pb-4 space-y-4 text-xl text-gray-800 font-serif italic leading-relaxed whitespace-pre-line">
          {data.appreciation_letter}
        </div>

        <div className="px-8 pb-8 pt-4 flex justify-end">
          <div className="pt-4 border-t border-gray-100/50 w-full flex justify-end">
            <p className="text-sm text-brand-green font-serif font-bold italic">— Sisi Terbaik Dirimu</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#ffffff] rounded-[14px] border-[0.5px] border-[rgba(90,138,106,0.18)] shadow-lg overflow-hidden"
        >
          <div className="bg-[#dceee0] px-5 py-3 flex items-center gap-3 border-b border-brand-green/10">
            <TrendingUp className="w-4 h-4 text-brand-green" />
            <h4 className="text-xs tracking-widest text-brand-green font-sans font-black">Pola emosimu</h4>
          </div>
          <div className="p-[18px]">
            <p className="text-lg font-serif italic text-gray-800 leading-relaxed">
              "{data.emotion_pattern}"
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#ffffff] rounded-[14px] border-[0.5px] border-[rgba(90,138,106,0.18)] shadow-lg overflow-hidden"
        >
          <div className="bg-[#dceee0] px-5 py-3 flex items-center gap-3 border-b border-brand-green/10">
            <Type className="w-4 h-4 text-brand-green" />
            <h4 className="text-xs tracking-widest text-brand-green font-sans font-black">Kata yang sering muncul</h4>
          </div>
          <div className="p-[18px]">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {data.frequent_words.map((wordObj, i) => {
                return (
                  <span
                    key={i}
                    className="text-[#5a8a6a] font-serif italic"
                    style={{ fontSize: '22px' }}
                  >
                    {wordObj.word}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
