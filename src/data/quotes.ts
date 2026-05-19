export const QUOTES = [
  "Terkadang keberanian terbesar adalah sekadar hadir dan bernapas melewati hari.",
  "Setiap hari adalah kesempatan baru untuk bertumbuh, meski lewat langkah paling kecil sekalipun.",
  "Dirimu yang hari ini adalah hasil dari perjuangan yang tak terlihat oleh orang lain. Berbanggalah.",
  "Beri ruang untuk perasaanmu, karena setiap emosi adalah tamu yang membawa pesan berharga.",
  "Kebahagiaan bukan tujuan, melainkan cara kita berjalan di tengah ketidakpastian.",
  "Istirahat bukanlah tanda menyerah; itu adalah caramu mengumpulkan kekuatan untuk melangkah lebih jauh.",
  "Jangan bandingkan musim bertumbuhmu dengan musim orang lain. Setiap bunga mekar di waktunya sendiri.",
  "Kebaikan kecil yang kamu berikan pada dirimu sendiri hari ini akan membuahkan ketenangan esok hari.",
  "Kamu tidak perlu menjadi sempurna untuk menjadi luar biasa. Cukup menjadi dirimu yang jujur.",
  "Hal-hal besar seringkali dimulai dari kesabaran dalam menghadapi hal-hal kecil yang sulit.",
  "Bernapaslah. Kamu sedang melakukan yang terbaik yang kamu bisa, dan itu sudah lebih dari cukup.",
  "Dalam keheningan, kita seringkali menemukan jawaban yang paling lantang dari dalam jiwa.",
  "Terima masa lalumu, peluk masa kinimu, dan percayalah pada hari esok yang sedang kamu bentuk.",
  "Kekuatan sejati bukan tentang tidak pernah jatuh, tapi tentang bagaimana kita bangkit dengan sisa tenaga yang ada.",
  "Jadilah penyemangat terbaik bagi dirimu sendiri, karena kamulah yang paling tahu beratnya perjuanganmu."
];

export const getQuoteOfTheDay = () => {
  const today = new Date();
  // Use day of the year to pick a consistent quote for the whole day
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  return QUOTES[dayOfYear % QUOTES.length];
};
