import { motion } from 'motion/react';
import { Sprout } from 'lucide-react';

interface HeroProps {
  heroImageUrl?: string | null;
}

export const Hero = ({ heroImageUrl }: HeroProps) => {
  return (
    <section className="h-auto bg-[#FDFCFB] flex flex-col items-center relative overflow-hidden font-sans border-b border-brand-green/5 m-0 p-0">
      
      {/* HERO CONTENT CONTAINER */}
      <div className="w-full flex flex-col relative z-20 m-0 p-0">
        {heroImageUrl ? (
          <div className="relative w-full flex flex-col m-0 p-0">
            
            {/* TEXT: Overlay on desktop, normal flow on mobile */}
            <div className="md:absolute md:top-[8%] lg:top-[10%] md:left-1/2 md:-translate-x-1/2 w-full px-6 py-10 md:py-0 text-center z-30 pointer-events-none md:pointer-events-auto">
              <h1 className="headline-line-1 text-3xl sm:text-4xl md:text-5xl font-serif text-[#2C2C2A] tracking-tight leading-tight mb-2">
                Ruang Aman untuk
              </h1>
              <h1 className="headline-line-2 text-3xl sm:text-4xl md:text-5xl font-serif italic text-sage-green font-medium tracking-tight leading-tight">
                Bertumbuh & Refleksi
              </h1>
            </div>

            {/* IMAGE: Below text on mobile, full width on desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full h-auto max-h-[85vh] overflow-hidden flex items-end"
            >
              <img 
                src={heroImageUrl} 
                alt="Ruang Bertumbuh - Ilustrasi Beranda" 
                className="w-full h-auto object-contain md:object-cover"
                style={{ maxHeight: '85vh' }}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              {/* Subtle overlay for depth on desktop */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
            </motion.div>

          </div>
        ) : (
          <div className="w-full h-[300px] bg-brand-green/5 animate-pulse flex items-center justify-center">
            <Sprout className="w-12 h-12 text-brand-green/20" />
          </div>
        )}
      </div>

      {/* Decorative dynamic circles */}
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-green/3 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px]" 
      />
    </section>
  );
};
