import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Sparkles, ChevronLeft } from 'lucide-react';

interface OnboardingProps {
  onComplete: (goal: string, goalText: string) => void;
  userName: string;
  logoUrl?: string | null;
}

const goals = [
  {
    id: 'deep_understanding',
    title: 'Mengenal diri lebih dalam',
    description: 'Memahami pola pikir, perasaan, dan nilai-nilaiku',
    confirmation: 'Aku di sini untuk mengenal diriku lebih dalam, satu hari dalam satu waktu.'
  },
  {
    id: 'daily_reflection',
    title: 'Membangun refleksi harian',
    description: 'Menulis setiap hari sebagai bentuk merawat diri',
    confirmation: 'Aku sedang membangun kebiasaan refleksi harian — pelan-pelan, tapi konsisten.'
  },
  {
    id: 'stress_management',
    title: 'Mengelola stres & emosi',
    description: 'Punya ruang aman untuk melepaskan beban pikiran',
    confirmation: 'Aku memberi dirimu ruang untuk merasa — tanpa menghakimi.'
  },
  {
    id: 'personal_growth',
    title: 'Bertumbuh secara personal',
    description: 'Menemukan versi terbaik diriku pelan-pelan',
    confirmation: 'Aku sedang bertumbuh, dan aku memberi diri sendiri ruang untuk itu.'
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, userName, logoUrl }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && selectedGoal) {
      setDirection(1);
      setStep(2);
    } else if (step === 2 && selectedGoal && selectedGoalData) {
      onComplete(selectedGoal, selectedGoalData.confirmation);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const goToStep = (targetStep: number) => {
    if (targetStep === step) return;
    if (targetStep === 2 && !selectedGoal) return;
    
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  const selectedGoalData = goals.find(g => g.id === selectedGoal);

  return (
    <div className="fixed inset-0 z-[60] bg-[#f7f5f0] flex flex-col items-center justify-center p-6 overflow-y-auto">
      {/* Back Button for Step 2 */}
      <AnimatePresence>
        {step === 2 && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handleBack}
            className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 group touch-target-min"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#5a8a6a] transition-all group-hover:bg-[#5a8a6a] group-hover:text-white group-hover:shadow-md">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-[#5a8a6a] font-medium text-sm transition-opacity group-hover:opacity-70 hidden sm:inline">Kembali</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl mx-auto space-y-12 py-10 relative">
        {/* Step Indicator */}
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => goToStep(1)}
            className={`group relative h-4 w-12 flex items-center justify-center transition-all duration-300`}
            aria-label="Langkah 1"
          >
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-[#5a8a6a]' : 'w-4 bg-[#5a8a6a]/20 group-hover:bg-[#5a8a6a]/40'}`} />
          </button>
          <button 
            onClick={() => goToStep(2)}
            disabled={!selectedGoal}
            className={`group relative h-4 w-12 flex items-center justify-center transition-all duration-300 ${!selectedGoal ? 'cursor-not-allowed opacity-50' : ''}`}
            aria-label="Langkah 2"
          >
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-[#5a8a6a]' : 'w-4 bg-[#5a8a6a]/20 group-hover:bg-[#5a8a6a]/40'}`} />
          </button>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 ? (
            <motion.div
              key="step1"
              custom={direction}
              variants={{
                enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 20 : -20 }),
                center: { opacity: 1, x: 0 },
                exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -20 : 20 })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-tight">
                  Apa yang ingin kamu capai <br /> di <span className="italic text-[#5a8a6a]">Ruang Bertumbuh?</span>
                </h2>
                <p className="text-gray-500 font-sans tracking-wide text-xs uppercase px-4">Pilih satu tujuan untuk memulai perjalananmu</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-6 rounded-2xl text-left transition-all border-2 duration-300 group relative ${
                      selectedGoal === goal.id 
                        ? 'bg-[#dceee0] border-[#5a8a6a] shadow-lg shadow-[#5a8a6a]/10' 
                        : 'bg-white border-transparent hover:border-[#5a8a6a]/20 hover:shadow-md'
                    }`}
                  >
                    <h3 className={`font-serif text-lg mb-1 transition-colors ${selectedGoal === goal.id ? 'text-[#5a8a6a]' : 'text-gray-900'}`}>
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-sans">{goal.description}</p>
                    
                    {selectedGoal === goal.id && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-[#5a8a6a] text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              custom={direction}
              variants={{
                enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 20 : -20 }),
                center: { opacity: 1, x: 0 },
                exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -20 : 20 })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-12 text-center"
            >
              <div className="space-y-6">
                <div className="w-28 h-28 bg-[#dceee0] rounded-[40px] flex items-center justify-center mx-auto text-[#5a8a6a] overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Sparkles className="w-12 h-12" />
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-relaxed max-w-lg mx-auto">
                  "{selectedGoalData?.confirmation}"
                </h3>
                <p className="text-gray-500 text-sm">
                  Pilihanmu sudah tersimpan, {userName.split(' ')[0]}. Mari kita mulai langkah kecil pertamamu.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center pt-8">
          <button
            onClick={handleNext}
            disabled={!selectedGoal}
            className={`group px-12 py-4 rounded-2xl flex items-center gap-4 transition-all active:scale-95 shadow-xl ${
              selectedGoal 
                ? 'bg-[#5a8a6a] text-white hover:shadow-[#5a8a6a]/20' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span className="font-bold uppercase tracking-widest text-xs">
              {step === 1 ? 'Lanjutkan' : 'Mulai perjalananku'}
            </span>
            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${!selectedGoal && 'opacity-30'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
