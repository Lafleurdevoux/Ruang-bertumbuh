import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { StoredReflection } from '../services/firebaseService';

interface PhotoDetailModalProps {
  reflection: StoredReflection | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({ reflection, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  if (!reflection) return null;

  const handleDelete = async () => {
    if (!reflection.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(reflection.id);
      onClose();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#f7f5f0] rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header Image */}
          <div className="h-[280px] w-full relative">
            <img 
              src={reflection.photoUrl} 
              alt="Memory Full" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#f7f5f0] to-transparent" />
          </div>

          {/* Content */}
          <div className="p-8 sm:p-10 -mt-8 relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-gray-500">
                <Calendar className="w-4 h-4 text-[#5a8a6a]" />
                <span className="text-sm font-medium">
                  {reflection.timestamp?.toDate().toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#dceee0] text-[#27500a] rounded-full">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs font-bold uppercase tracking-wider">{reflection.emotion}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-10 h-1 border-t-2 border-[#5a8a6a]/20" />
              <p className="text-xl sm:text-2xl font-serif text-gray-800 italic leading-relaxed">
                "{reflection.content}"
              </p>
            </div>

            <div className="pt-6 flex flex-col gap-3">
              {showConfirm ? (
                <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Ya, Hapus Jurnal
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 rounded-2xl bg-white border border-gray-100 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Tutup
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all"
                      title="Hapus Jurnal"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
