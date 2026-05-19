/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Atmosphere } from './components/Atmosphere';
import { AudioRecorder } from './components/AudioRecorder';
import { ReflectionDisplay } from './components/ReflectionDisplay';
import { ReflectionCalendar } from './components/ReflectionCalendar';
import { StrengthSpotterDisplay } from './components/StrengthSpotterDisplay';
import { Hero } from './components/Hero';
import { PhotoStrip } from './components/PhotoStrip';
import { MusicPlayer } from './components/MusicPlayer';
import { MeditationSection } from './components/MeditationSection';
import { analyzeReflection, analyzeStrengths, MindfulnessResponse, StrengthSpotterResponse } from './services/geminiService';
import { mindfulnessLibrary } from './data/mindfulnessLibrary';
import { MessageSquare, Mic, Sparkles, Award, LogOut, LayoutDashboard, PenLine, LogIn, Loader2, X, ArrowRight, Trash2, Pencil, Sprout, Camera, Image as ImageIcon, Music } from 'lucide-react';
import { Onboarding } from './components/Onboarding';
import { auth, signInWithGoogle, saveReflection, getAllReflections, getRecentReflections, StoredReflection, deleteReflection, updateReflection, getUserProfile, updateUserProfile, UserProfile, uploadImage, resolveStorageUrl } from './services/firebaseService';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

import { getQuoteOfTheDay } from './data/quotes';

import { Navbar } from './components/Navbar';

type Mode = 'journal' | 'dashboard' | 'meditation' | 'gallery';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [onboardingMode, setOnboardingMode] = useState(false);
  const [mode, setMode] = useState<Mode>('dashboard');
  
  const galeriRef = useRef<HTMLDivElement>(null);

  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [mirrorResponse, setMirrorResponse] = useState<MindfulnessResponse | null>(null);
  const [strengthResponse, setStrengthResponse] = useState<StrengthSpotterResponse | null>(null);
  const [selectedHistoryReflections, setSelectedHistoryReflections] = useState<StoredReflection[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedReflectionId, setExpandedReflectionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reflections, setReflections] = useState<StoredReflection[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isMusicPlayerHidden, setIsMusicPlayerHidden] = useState(false);

  const handleNavItemClick = (item: 'Beranda' | 'Jurnal' | 'Galeri' | 'Meditasi') => {
    // Shared reset logic for all tabs
    setSelectedHistoryReflections([]);
    setSelectedDate(null);
    setExpandedReflectionId(null);
    setEditingId(null);
    setDeleteConfirmationId(null);

    if (item === 'Beranda') {
      reset();
    } else if (item === 'Jurnal') {
      setMode('journal');
      setMirrorResponse(null);
      setStrengthResponse(null);
    } else if (item === 'Galeri') {
      setMode('gallery');
      setMirrorResponse(null);
      setStrengthResponse(null);
    } else if (item === 'Meditasi') {
      setMode('meditation');
      setMirrorResponse(null);
      setStrengthResponse(null);
    }
  };

  const getActiveNavItem = (): 'Beranda' | 'Jurnal' | 'Galeri' | 'Meditasi' => {
    if (mode === 'journal') return 'Jurnal';
    if (mode === 'meditation') return 'Meditasi';
    if (mode === 'gallery') return 'Galeri';
    return 'Beranda';
  };

  useEffect(() => {
    const fetchAssets = async () => {
      const [logo, hero] = await Promise.all([
        resolveStorageUrl("gs://silent-sweep-433515-i7.firebasestorage.app/logoweb.png"),
        resolveStorageUrl("gs://silent-sweep-433515-i7.firebasestorage.app/logofix.png")
      ]);
      setLogoUrl(logo);
      setHeroImageUrl(hero);
    };
    fetchAssets();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        console.log('User profile:', profile);
        console.log('Onboarding completed:', profile?.onboarding_completed);
        
        setUserProfile(profile);
        if (!profile || profile.onboarding_completed !== true) {
          setOnboardingMode(true);
        }
        fetchReflections(u.uid);
      } else {
        setUserProfile(null);
        setOnboardingMode(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = async (goal: string, goalText: string) => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, {
        onboarding_completed: true,
        goal: goal,
        goal_text: goalText
      });
      const updatedProfile = await getUserProfile(user.uid);
      setUserProfile(updatedProfile);
      setOnboardingMode(false);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan pilihan tujuanmu.");
    }
  };

  // We can remove getGoalText as it's now stored in Firestore

  async function compressImage(file: File): Promise<Blob> {
    console.log("Starting image compression for:", file.name, file.size);
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const maxSize = 800;
          let w = img.width, h = img.height;
          if (w > h && w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
          else if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          canvas.toBlob(blob => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              console.log("Compression done. Original:", file.size, "Compressed:", blob.size);
              resolve(blob);
            }
            else reject(new Error("Gagal mengompres gambar."));
          }, 'image/jpeg', 0.75);
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          console.error("Compression runtime error:", err);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        console.error("Failed to load image for compression");
        reject(new Error("Gagal memuat gambar untuk kompresi."));
      };
      img.src = objectUrl;
    });
  }

  const fetchReflections = async (uid: string) => {
    try {
      const data = await getAllReflections(uid);
      const sorted = [...data].sort((a, b) => {
        const tA = a.timestamp?.toMillis() || 0;
        const tB = b.timestamp?.toMillis() || 0;
        return tB - tA;
      });
      setReflections(sorted);
      
      // Update selected history reflections if modal is open
      if (selectedDate) {
        const dateStr = selectedDate.toDateString();
        const refsForDate = sorted.filter(r => r.timestamp?.toDate().toDateString() === dateStr);
        setSelectedHistoryReflections(refsForDate);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memperbarui riwayat jurnal.");
    }
  };

  const handleDeleteReflection = async (id: string | undefined) => {
    if (!id || !user) return;
    
    try {
      await deleteReflection(id);
      setDeleteConfirmationId(null);
      await fetchReflections(user.uid);
    } catch (err) {
      setError("Gagal menghapus jurnal.");
    }
  };

  const handleEditReflection = async (id: string | undefined, currentContent: string) => {
    if (!id || !user) return;
    setEditingId(id);
    setEditValue(currentContent);
  };

  const handleEditSave = async () => {
    if (!editingId || !user) return;
    try {
      await updateReflection(editingId, editValue);
      setEditingId(null);
      await fetchReflections(user.uid);
    } catch (err) {
      setError("Gagal memperbarui jurnal.");
    }
  };

  const handleLogoChange = async (file: File) => {
    if (!user) return;
    setLogoUploading(true);
    setError(null);
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `logo_${Date.now()}.jpg`;
      try {
        const uploadedUrl = await uploadImage(user.uid, compressedBlob, fileName);
        if (uploadedUrl) {
          await updateUserProfile(user.uid, { customLogoURL: uploadedUrl });
          const updatedProfile = await getUserProfile(user.uid);
          setUserProfile(updatedProfile);
          return;
        }
      } catch (storageErr) {
        console.warn("Storage failed, trying base64 fallback", storageErr);
      }

      // Fallback to small base64 if Storage fails
      const smallBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 120; // Small enough for Firestore
            canvas.width = size; canvas.height = size;
            canvas.getContext('2d')?.drawImage(img, 0, 0, size, size);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });

      await updateUserProfile(user.uid, { customLogoURL: smallBase64 });
      const updatedProfile = await getUserProfile(user.uid);
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error("Logo upload error:", err);
      setError("Gagal mengganti logo. Pastikan format gambar benar.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleMirrorProcess = async (input: string | { mimeType: string, data: string }) => {
    if (!user) return;
    setIsProcessing(true);
    setProcessStatus('Menganalisis perasaanmu...');
    setError(null);
    try {
      // Pass the photo preview (data URL) to Gemini if it exists
      let result: MindfulnessResponse;
      try {
        result = await analyzeReflection(input, photo || undefined);
        
        // Smart picking of mindfulness activity from library
        if (result.tampilkan_mindfulness && result.kategori_mindfulness) {
          const filtered = mindfulnessLibrary.filter(a => a.category === result.kategori_mindfulness);
          if (filtered.length > 0) {
            const lastId = localStorage.getItem('last_mindfulness_id');
            const available = filtered.filter(a => a.id !== lastId);
            const pool = available.length > 0 ? available : filtered;
            const picked = pool[Math.floor(Math.random() * pool.length)];
            
            localStorage.setItem('last_mindfulness_id', picked.id);
            
            result.aktivitas_mindfulness = {
              title: picked.title,
              duration_minutes: picked.duration_minutes,
              instruction: picked.instruction
            };
          }
        }
      } catch (aiErr: any) {
        console.error("AI Analysis Failed:", aiErr);
        if (aiErr.message?.includes("kuota") || aiErr.message?.includes("quota")) {
          // Fallback response if AI is out of quota
          result = {
            kategori: 'D',
            mood: 'Netral',
            respon: "Terima kasih sudah berbagi. Maaf, saat ini AI saya sedang beristirahat karena kuota harian tercapai, jadi saya belum bisa memberikan balasan mendalam. Namun, jurnal Anda tetap tersimpan aman di sini.",
            tampilkan_mindfulness: false,
            kategori_mindfulness: null
          };
          setError("Kuota harian AI sedang penuh, tapi jurnalmu tetap berhasil disimpan!");
        } else {
          throw aiErr;
        }
      }

      setMirrorResponse(result);
      
      // Handle Photo Upload if any
      let photoUrl = undefined;
      if (typeof input === 'string' && pendingPhotoFile) {
        try {
          setProcessStatus('Mengompres foto...');
          const compressedBlob = await compressImage(pendingPhotoFile);
          
          setProcessStatus('Mengupload foto...');
          const fileName = `${Date.now()}.jpg`;
          const uploadedUrl = await uploadImage(user.uid, compressedBlob, fileName);
          if (uploadedUrl) photoUrl = uploadedUrl;
        } catch (uploadErr) {
          console.error("Storage Error during process:", uploadErr);
          // Don't fail the whole process if only upload fails, but inform user
          setError("Jurnal disimpan tanpa foto karena ada masalah koneksi/izin penyimpanan.");
        }
      }

      setProcessStatus('Menyimpan jurnal...');
      // Save to Firebase
      const content = typeof input === 'string' ? input : '[Audio Reflection]';
      const type = typeof input === 'string' ? 'text' : 'audio';
      await saveReflection(user.uid, content, type, result, photoUrl);
      setPhoto(null);
      setPendingPhotoFile(null);
      fetchReflections(user.uid);
      setProcessStatus('');
    } catch (err) {
      console.error("Process Error:", err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  const handleStrengthAnalysis = async () => {
    if (!user || reflections.length === 0) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      // Get reflections from the last 7 days for "weekly" analysis
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      
      const recent = reflections.filter(r => r.timestamp?.toDate() >= cutoff);
      
      if (recent.length < 3) {
        throw new Error("Butuh minimal 3 jurnal dalam 7 hari terakhir untuk analisis mingguan yang akurat.");
      }

      const inputNarrative = recent.map(r => `Emosi: ${r.emotion}\nKonten: ${r.content}`).join('\n---\n');
      const result = await analyzeStrengths(inputNarrative);
      setStrengthResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menganalisis kekuatan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setMirrorResponse(null);
    setStrengthResponse(null);
    setText('');
    setError(null);
    setMode('dashboard');
    setSelectedHistoryReflections([]);
    setSelectedDate(null);
    setExpandedReflectionId(null);
    setEditingId(null);
    setDeleteConfirmationId(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#E4D8CE] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen font-sans bg-[#FDFCFB] scroll-smooth flex flex-col">
        <div className="relative overflow-hidden flex flex-col items-center justify-center p-6 text-[#1a1a1a] flex-1">
          <Atmosphere />
          
          {/* Main Content */}
          <main className="z-10 text-center space-y-12 max-w-5xl px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center">
                {logoUrl && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                  >
                    <img 
                      src={logoUrl} 
                      alt="Ruang Bertumbuh Logo" 
                      className="w-32 sm:w-40 h-auto object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                )}
                <h1 className="text-7xl md:text-[8rem] font-display font-black italic tracking-tighter text-[#1a1a1a] drop-shadow-md leading-none relative z-10">
                    Ruang
                  </h1>
                <h1 className="text-7xl md:text-[8rem] font-display font-black italic tracking-tighter text-[#6da85d] drop-shadow-md leading-none mt-[-0.2em]">
                  Bertumbuh
                </h1>
              </div>
              <p className="text-gray-700 font-serif max-w-3xl mx-auto leading-relaxed" style={{ fontSize: '24px' }}>
                "Tuliskan hal-hal yang belum sempat kamu ucapkan. Terkadang, untuk memahami diri sendiri dimulai dari satu kalimat yang paling jujur"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center"
            >
              <button
                onClick={signInWithGoogle}
                className="group bg-[#151411] text-white rounded-full py-3 pl-12 pr-3 flex items-center justify-between gap-16 hover:bg-black transition-all shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] active:scale-95"
              >
                <div className="flex items-center gap-6">
                  <svg className="w-8 h-8" viewBox="0 0 48 48">
                    <path fill="#ea4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285f4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#fbbc05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34a853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="text-xl font-bold tracking-tight">Masuk dengan Google</span>
                </div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-8 h-8" />
                </div>
              </button>
            </motion.div>
          </main>
        </div>
        <footer className="w-full py-8 text-center z-10 border-t border-gray-100 bg-white">
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-4">
            <span className="w-8 sm:w-12 h-px bg-gray-100" />
            RUANG BERTUMBUH - Tempat Pulang ke Diri Sendiri
            <span className="w-8 sm:w-12 h-px bg-gray-100" />
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans scroll-smooth">
      {user && !onboardingMode && (
        <Navbar 
          userName={user.displayName?.split(' ')[0] || 'Sobat'} 
          activeItem={getActiveNavItem()} 
          onItemClick={handleNavItemClick} 
          onLogout={() => signOut(auth)} 
          onLogoClick={reset} 
          logoUrl={logoUrl}
        />
      )}

      {onboardingMode && user && (
        <Onboarding 
          userName={user.displayName || 'Sobat'} 
          onComplete={handleOnboardingComplete} 
          logoUrl={logoUrl}
        />
      )}

      {mode === 'dashboard' && !mirrorResponse && !strengthResponse && <Hero heroImageUrl={heroImageUrl} />}
      <div className="relative overflow-hidden flex flex-col items-center">
        <Atmosphere />

        <main className="w-full flex-1 flex flex-col items-center justify-start z-10 py-2 sm:py-12">
        {user && !onboardingMode && (
          <div className={`w-full max-w-5xl px-4 relative group/music transition-all duration-300 ${mode !== 'dashboard' ? 'h-0 overflow-hidden opacity-0 pointer-events-none mb-0' : ''}`}>
             <div className={`transition-all duration-700 ease-in-out origin-top ${isMusicPlayerHidden ? 'opacity-0 max-h-0 pointer-events-none mb-0 scale-95 overflow-hidden' : 'opacity-100 max-h-[300px] mb-2 sm:mb-8 scale-100'}`}>
                <MusicPlayer />
             </div>
             <button 
               onClick={() => setIsMusicPlayerHidden(!isMusicPlayerHidden)}
               className={`absolute -top-4 right-8 glass p-2.5 rounded-2xl text-brand-green hover:bg-white shadow-sm border border-brand-green/10 transition-all flex items-center gap-2 z-20 ${isMusicPlayerHidden ? 'bg-white shadow-xl translate-y-2' : 'opacity-0 group-hover/music:opacity-100 translate-y-0'}`}
               title={isMusicPlayerHidden ? "Tampilkan Pemutar Musik" : "Sembunyikan Pemutar Musik"}
             >
               {isMusicPlayerHidden ? (
                 <>
                   <div className="flex items-center gap-2">
                     <Music className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Buka Musik</span>
                   </div>
                   <div className="flex gap-1">
                     <div className="w-1 h-3 bg-brand-green/20 rounded-full animate-[bounce_1s_infinite_0ms]" />
                     <div className="w-1 h-4 bg-brand-green/30 rounded-full animate-[bounce_1s_infinite_200ms]" />
                     <div className="w-1 h-3 bg-brand-green/20 rounded-full animate-[bounce_1s_infinite_400ms]" />
                   </div>
                 </>
               ) : (
                 <>
                   <X className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Sembunyikan</span>
                 </>
               )}
             </button>
          </div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-6 py-3 glass bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs uppercase tracking-widest font-bold flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4" /> {error}
            <button onClick={() => setError(null)} className="ml-2 hover:text-gray-900">✕</button>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {mirrorResponse ? (
            <div className="w-full max-w-2xl px-4 pb-20">
              <ReflectionDisplay data={mirrorResponse} />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={reset}
                className="mt-8 w-full py-4 glass rounded-2xl text-brand-green uppercase tracking-widest text-xs font-bold hover:bg-brand-green-light transition-colors border border-brand-green/20"
              >
                Kembali ke Dasbor
              </motion.button>
            </div>
          ) : strengthResponse ? (
            <div className="w-full max-w-2xl px-4 pb-20">
              <StrengthSpotterDisplay data={strengthResponse} />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={reset}
                className="mt-8 w-full py-4 glass rounded-2xl text-brand-green uppercase tracking-widest text-xs font-bold hover:bg-brand-green-light transition-colors border border-brand-green/20"
              >
                Kembali ke Dasbor
              </motion.button>
            </div>
          ) : mode === 'journal' ? (
            <motion.div
              key="journal-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl text-center space-y-12"
            >
              <div className="space-y-4 px-4 text-gray-800">
                <h2 className="text-4xl sm:text-6xl font-serif text-gray-900 tracking-tight leading-tight">
                  Apa yang kamu rasakan <br /> <span className="italic text-brand-green">saat ini?</span>
                </h2>
                <p className="text-gray-500 text-lg sm:text-xl font-serif">
                  Tuliskan hal-hal yang belum sempat kamu ucapkan. Terkadang, untuk memahami diri sendiri dimulai dari satu kalimat yang paling jujur
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-widest transition-all font-semibold flex items-center gap-2 ${inputMode === 'text' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'glass text-gray-500 hover:bg-white'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Teks
                </button>
                <button
                  onClick={() => setInputMode('audio')}
                  className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-widest transition-all font-semibold flex items-center gap-2 ${inputMode === 'audio' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'glass text-gray-500 hover:bg-white'}`}
                >
                  <Mic className="w-4 h-4" /> Suara
                </button>
              </div>

              <div className="space-y-8 w-full max-w-xl mx-auto">
                <div className="glass p-8 sm:p-10 rounded-[40px] min-h-[280px] flex flex-col items-center justify-center border-brand-green/30 border-2 mx-4 shadow-[0_20px_50px_-10px_rgba(109,168,93,0.3)] bg-brand-green-light/30 relative">
                  {inputMode === 'text' ? (
                    <div className="w-full flex flex-col gap-4">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ceriakan harimu atau curahkan keluh kesahmu..."
                        className="w-full bg-transparent border border-[#d4e8d8] focus:border-[#5a8a6a] focus:shadow-[0_0_0_3px_rgba(90,138,106,0.15)] focus:outline-none transition-[border-color,box-shadow] duration-200 text-xl sm:text-2xl font-serif text-gray-900 resize-none h-40 placeholder:text-gray-300 p-4 rounded-2xl"
                        autoFocus
                      />
                      <div className="flex flex-col items-start gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          {photo && (
                            <div className="relative group p-1 bg-white rounded-xl shadow-md border border-brand-green/20">
                              <img src={photo} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                              <button 
                                onClick={() => { setPhoto(null); setPendingPhotoFile(null); }}
                                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <label className="flex items-center gap-2 text-sm text-brand-green border border-brand-green/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-brand-green/10 transition-colors relative">
                              <Camera className="w-4 h-4" />
                              <span className="font-medium">Ambil foto</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                className="sr-only" 
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setPendingPhotoFile(file);
                                    try {
                                      const compressed = await compressImage(file);
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setPhoto(reader.result as string);
                                      };
                                      reader.readAsDataURL(compressed);
                                    } catch (err) {
                                      console.error("Compression err", err);
                                      // fallback to original if compression fails
                                      const reader = new FileReader();
                                      reader.onloadend = () => setPhoto(reader.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }
                                }} 
                              />
                            </label>
                            <label className="flex items-center gap-2 text-sm text-brand-green border border-brand-green/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-brand-green/10 transition-colors relative">
                              <ImageIcon className="w-4 h-4" />
                              <span className="font-medium">Pilih dari galeri</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="sr-only" 
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setPendingPhotoFile(file);
                                    try {
                                      const compressed = await compressImage(file);
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setPhoto(reader.result as string);
                                      };
                                      reader.readAsDataURL(compressed);
                                    } catch (err) {
                                      console.error("Compression err", err);
                                      const reader = new FileReader();
                                      reader.onloadend = () => setPhoto(reader.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }
                                }} 
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <AudioRecorder 
                      isProcessing={isProcessing}
                      onRecordingComplete={(base64, mimeType) => handleMirrorProcess({ data: base64, mimeType })} 
                    />
                  )}

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-brand-green-light/90 backdrop-blur-sm rounded-[40px] z-50 text-center px-6"
                    >
                      <Loader2 className="w-12 h-12 text-brand-green animate-spin mb-4" />
                      <div className="space-y-1">
                        <p className="text-brand-green font-black uppercase tracking-[0.2em] text-[10px]">
                          {processStatus || 'Menganalisis...'}
                        </p>
                        <p className="text-[#5a8a6a] text-[8px] animate-pulse">
                          Tarik napas perlahan...
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-between items-center px-8 sm:px-12">
                  <button 
                    onClick={() => setMode('dashboard')} 
                    className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 font-bold"
                  >
                    {inputMode === 'text' ? 'Batal' : 'Kembali'}
                  </button>
                  
                  {inputMode === 'text' && (
                    <button
                      onClick={() => text && handleMirrorProcess(text)}
                      disabled={!text || isProcessing}
                      className="px-8 py-3.5 bg-brand-green rounded-2xl text-white font-bold hover:bg-brand-green/80 transition-all disabled:opacity-50 shadow-lg shadow-brand-green/20 active:scale-95 uppercase tracking-widest text-xs"
                    >
                      {isProcessing ? 'Merenung...' : 'Rangkai Jurnal'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : mode === 'gallery' ? (
            <motion.div
              key="gallery-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-5xl px-4"
            >
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl sm:text-6xl font-serif text-gray-900 tracking-tight leading-tight">
                    Galeri <span className="italic text-brand-green">Jurnal</span>
                  </h2>
                  <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto">
                    Kumpulan momen dan foto yang menemani perjalanan bertumbuhmu
                  </p>
                </div>
                <div className="pt-8">
                  <PhotoStrip reflections={reflections} onDelete={handleDeleteReflection} />
                </div>
              </div>
            </motion.div>
          ) : mode === 'meditation' ? (
            <motion.div
              key="meditation-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <MeditationSection />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col transition-all"
            >
              <div className="w-full max-w-5xl mx-auto px-4 space-y-8 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-5 items-start">
                <div className="space-y-8">
                  <div className="glass p-8 sm:p-10 rounded-[40px] flex flex-col sm:flex-row items-center gap-8 shadow-xl border border-gray-100">
                  <div className="relative group">
                    <img 
                      src={user.photoURL || ''} 
                      alt={user.displayName || ''} 
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] border-4 border-brand-green-light shadow-md group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute -bottom-2 -right-2 bg-brand-green p-2 rounded-xl shadow-lg border border-white/20">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    
                    <label className="absolute -top-2 -left-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors z-30" title="Ganti Logo Atas">
                      {logoUploading ? <Loader2 className="w-4 h-4 text-brand-green animate-spin" /> : <ImageIcon className="w-4 h-4 text-gray-600" />}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoChange(file);
                        }} 
                      />
                    </label>
                  </div>
                  <div className="text-center sm:text-left space-y-4 flex-1">
                    <div className="space-y-1">
                      <h2 className="text-3xl sm:text-4xl font-handwritten text-gray-900">Halo, {user.displayName?.split(' ')[0]}</h2>
                      <div className="space-y-1">
                        <p className="text-gray-500 font-serif" style={{ fontSize: '19px', fontStyle: 'normal' }}>Bagaimana kabarmu hari ini?</p>
                        {userProfile?.goal_text && (
                          <p className="text-[#5a8a6a] italic font-serif" style={{ fontSize: '14px' }}>
                            {userProfile.goal_text}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setMode('journal')}
                      className="px-8 py-4 bg-brand-green rounded-2xl text-white font-black hover:bg-brand-green/80 transition-all shadow-xl shadow-brand-green/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                      <PenLine className="w-5 h-5" /> Mulai Menulis Jurnal
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-6 rounded-[32px] border border-gray-100 bg-white shadow-xl">
                    <p className="text-3xl font-serif text-brand-green italic">{reflections.length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Total Jurnal</p>
                  </div>
                  <div className="glass p-6 rounded-[32px] border border-gray-100 bg-white shadow-xl">
                    <p className="text-3xl font-serif text-brand-green italic">{reflections.filter(r => r.type === 'audio').length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Rekaman Suara</p>
                  </div>
                </div>

                <div className="glass p-8 sm:p-10 rounded-[40px] space-y-8 border border-gray-100 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Award className="w-32 h-32 text-brand-green" />
                  </div>
                  <div className="space-y-2 relative">
                    <h3 className="text-2xl font-serif" style={{ color: '#096e00' }}>Pola diri</h3>
                    <p className="text-gray-500 max-w-md leading-relaxed" style={{ fontFamily: 'Georgia, serif', fontSize: '17px' }}>Analisis pola kebaikan dan nilai diri dari seluruh catatan mingguanmu secara otomatis.</p>
                  </div>
                  <button
                    onClick={handleStrengthAnalysis}
                    disabled={reflections.filter(r => {
                      const cutoff = new Date();
                      cutoff.setDate(cutoff.getDate() - 7);
                      return r.timestamp?.toDate() >= cutoff;
                    }).length < 3 || isProcessing}
                    className="relative px-8 py-4 bg-brand-green-light border border-brand-green/20 rounded-2xl text-brand-green font-bold hover:bg-brand-green/10 transition-all shadow-sm active:scale-95 uppercase tracking-widest text-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Menganalisis...</>
                    ) : (
                      <><Award className="w-4 h-4" /> Cari Nilai Diriku</>
                    )}
                  </button>
                  {(() => {
                    const cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - 7);
                    const recentCount = reflections.filter(r => r.timestamp?.toDate() >= cutoff).length;
                    if (recentCount < 3) {
                      return (
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                          Butuh minimal 3 jurnal dalam 7 hari terakhir. (Kurang {3 - recentCount} lagi)
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              <div className="space-y-6">
                <ReflectionCalendar 
                  reflections={reflections} 
                  onSelectDate={(refs, date) => {
                    setSelectedHistoryReflections(refs);
                    setSelectedDate(date);
                  }}
                />
                
                <div className="glass p-8 rounded-[40px] border border-gray-100 bg-white shadow-xl space-y-4">
                  <h4 className="text-[13.588235px] uppercase tracking-[0.2em] text-brand-green font-bold">Kutipan Hari Ini</h4>
                  <p className="font-serif italic text-gray-600 leading-relaxed" style={{ fontSize: '22px' }}>
                    "{getQuoteOfTheDay()}"
                  </p>
                </div>
              </div>
            </div>

            </div>
          </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="w-full max-w-5xl mx-auto py-8 text-center z-10 border-t border-gray-100 mt-auto">
        <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-4">
          <span className="w-8 sm:w-12 h-px bg-gray-100" />
          RUANG BERTUMBUH - Tempat Pulang ke Diri Sendiri
          <span className="w-8 sm:w-12 h-px bg-gray-100" />
        </p>
      </footer>

      {/* History Modal */}
      <AnimatePresence>
        {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedDate(null); setSelectedHistoryReflections([]); setExpandedReflectionId(null); }}
              className="absolute inset-0 bg-gray-400/20 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass p-6 sm:p-10 rounded-[40px] border border-gray-100 shadow-2xl scrollbar-hide"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-green">Arsip Jurnal</h3>
                  <p className="text-2xl font-serif text-gray-900">
                    {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedDate(null); setSelectedHistoryReflections([]); setExpandedReflectionId(null); }}
                  className="p-3 glass rounded-2xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {selectedHistoryReflections.map((ref, idx) => (
                  <div key={ref.id || idx} className="space-y-4">
                    <div 
                      onClick={() => setExpandedReflectionId(expandedReflectionId === ref.id ? null : ref.id || null)}
                      className={`glass p-6 rounded-3xl cursor-pointer transition-all border border-gray-100 hover:border-brand-green/20 group relative overflow-hidden ${expandedReflectionId === ref.id ? 'bg-brand-green-light' : 'bg-white/40'}`}
                    >
                        <div className="flex items-start gap-4">
                          {ref.photoUrl && (
                            <div className="relative shrink-0 z-10">
                              <img src={ref.photoUrl} alt="Thumbnail" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-100 shadow-sm transition-transform group-hover:scale-105" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-brand-green">
                                  {ref.timestamp?.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-bold ${ref.type === 'audio' ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-500'}`}>
                                  {ref.type === 'audio' ? 'Suara' : 'Teks'}
                                </span>
                             </div>
                             <p className="text-lg font-serif text-gray-800 italic line-clamp-2 group-hover:line-clamp-none transition-all">
                                "{ref.content}"
                             </p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0 z-20">
                            {deleteConfirmationId === ref.id ? (
                              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteReflection(ref.id); }}
                                  className="px-3 py-1 bg-rose-500 text-white text-[8px] font-bold uppercase rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
                                >
                                  Hapus
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmationId(null); }}
                                  className="px-3 py-1 bg-gray-100 text-gray-500 text-[8px] font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                {ref.type === 'text' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEditReflection(ref.id, ref.content); }}
                                    className="w-8 h-8 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-brand-green-light hover:text-brand-green transition-all"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmationId(ref.id || null); }}
                                  className="w-8 h-8 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      {editingId === ref.id && (
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-brand-green/20 space-y-3 animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-serif italic text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-4 py-1.5 text-[10px] font-bold uppercase text-gray-400 hover:text-gray-600"
                            >
                              Batal
                            </button>
                            <button
                              onClick={handleEditSave}
                              className="px-4 py-1.5 bg-brand-green text-white text-[10px] font-bold uppercase rounded-xl hover:bg-brand-green/80 transition-all"
                            >
                              Simpan Perubahan
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Emosi: {ref.emotion}</p>
                        <p className="text-[10px] uppercase tracking-widest text-brand-green font-bold group-hover:underline">
                          {expandedReflectionId === ref.id ? 'Tutup Analisis' : 'Lihat Analisis'}
                        </p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedReflectionId === ref.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-1">
                            <ReflectionDisplay data={ref.response} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setSelectedDate(null); setSelectedHistoryReflections([]); setExpandedReflectionId(null); }}
                className="mt-10 w-full py-4 glass rounded-2xl text-brand-green uppercase tracking-widest text-xs font-bold hover:bg-brand-green-light transition-colors border border-brand-green/20"
              >
                Tutup Arsip
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

