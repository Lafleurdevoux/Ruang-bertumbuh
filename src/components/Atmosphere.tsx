import React from 'react';

import { motion } from 'motion/react';

export const Atmosphere: React.FC = () => {
  return (
    <div className="atmosphere pointer-events-none bg-[#FDF8F3]">
      <motion.div
        className="atmosphere-blob bg-[#D8E2DC]/50 w-[1000px] h-[1000px] top-[10%] left-[10%] opacity-40"
        animate={{ 
          scale: [1, 1.1, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="atmosphere-blob bg-[#E9C46A]/20 w-[800px] h-[800px] top-[-20%] right-[-10%] opacity-40 blur-[150px]"
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 60, 0]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="atmosphere-blob bg-[#E2BCB7]/30 w-[900px] h-[900px] bottom-[-10%] left-[-10%] opacity-40 blur-[180px]"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, 60, 0],
          y: [0, -40, 0]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
