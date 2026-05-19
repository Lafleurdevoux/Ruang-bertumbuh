import { LogOut, Leaf, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface NavbarProps {
  userName: string;
  activeItem: 'Beranda' | 'Jurnal' | 'Galeri' | 'Meditasi';
  onItemClick: (item: 'Beranda' | 'Jurnal' | 'Galeri' | 'Meditasi') => void;
  onLogout: () => void;
  onLogoClick: () => void;
  logoUrl?: string | null;
}

export const Navbar = ({ userName, activeItem, onItemClick, onLogout, onLogoClick, logoUrl }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems: ('Beranda' | 'Jurnal' | 'Galeri' | 'Meditasi')[] = ['Beranda', 'Jurnal', 'Galeri', 'Meditasi'];

  const handleItemClick = (item: 'Beranda' | 'Jurnal' | 'Galeri' | 'Meditasi') => {
    onItemClick(item);
    setIsMenuOpen(false);
  };

  return (
    <nav className="w-full z-[100] sticky top-0">
      <div className="bg-[#FFFDF9] border-b border-black h-24 px-6 sm:px-12 flex items-center justify-between shadow-[0_4px_0_0_#000] transition-all relative z-50">
        
        {/* Logo & Brand */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-3 group"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-black shadow-[2px_2px_0_0_#000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Leaf className="w-6 h-6 text-[#8B5E3C]" />
            )}
          </div>
          <span className="font-serif text-xl font-bold text-[#3E2723] hidden sm:block">
            Ruang Bertumbuh
          </span>
        </button>

        {/* Navigation Menu - Desktop */}
        <div className="hidden md:flex items-center border border-[#3E2723] rounded-full p-1.5 bg-white/50">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => handleItemClick(item)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeItem === item 
                  ? 'bg-[#3E2723] text-[#FFFDF9] shadow-inner' 
                  : 'text-[#8B5E3C]/60 hover:text-[#3E2723]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* User & Actions (Desktop/Tablet) */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 bg-[#5a8a6a] rounded-full shadow-[0_0_8px_rgba(90,138,106,0.8)] animate-pulse" />
            <span className="font-handwritten text-xl text-[#3E2723] italic">
              Halo, {userName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Hamburger Menu - Mobile */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center border border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95 group"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button 
              onClick={onLogout}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95 group"
              title="Keluar"
            >
              <LogOut className="w-5 h-5 text-black group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[40] md:hidden"
            />
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-24 left-0 w-full bg-[#FFFDF9] border-b border-black shadow-[0_4px_10px_rgba(0,0,0,0.1)] z-[45] md:hidden overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                <div className="flex items-center gap-3 mb-2 px-2 sm:hidden">
                  <div className="w-2 h-2 bg-[#5a8a6a] rounded-full shadow-[0_0_8px_rgba(90,138,106,0.8)] animate-pulse" />
                  <span className="font-handwritten text-xl text-[#3E2723] italic">
                    Halo, {userName}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleItemClick(item)}
                      className={`px-6 py-4 rounded-2xl text-base font-serif font-medium transition-all border border-black ${
                        activeItem === item 
                          ? 'bg-[#3E2723] text-[#FFFDF9] shadow-[3px_3px_0_0_#000]' 
                          : 'bg-white text-[#8B5E3C] shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

