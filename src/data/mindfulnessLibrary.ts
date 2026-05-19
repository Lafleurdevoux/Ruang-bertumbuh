export type MindfulnessCategory = 
  | 'breathing' 
  | 'grounding' 
  | 'body_awareness' 
  | 'self_compassion' 
  | 'cognitive_release' 
  | 'expressive_release' 
  | 'reflection' 
  | 'gratitude';

export interface MindfulnessActivity {
  id: string;
  category: MindfulnessCategory;
  title: string;
  duration_minutes: number;
  for_moods: string[];
  instruction: string;
  modality: 'passive' | 'active' | 'reflective' | 'verbal';
}

export const mindfulnessLibrary: MindfulnessActivity[] = [
  // Kategori 1 - BREATHING
  {
    id: 'box_breathing',
    category: 'breathing',
    title: 'Napas Kotak (Box Breathing)',
    duration_minutes: 4,
    for_moods: ['cemas', 'panik', 'stres', 'marah'],
    instruction: 'Tarik napas selama 4 hitungan, tahan napas selama 4 hitungan, buang napas melalui mulut selama 4 hitungan, dan tahan kosong selama 4 hitungan. Bayangkan kamu sedang menggambar sisi-sisi persegi dengan napasmu. Ulangi siklus ini 4-6 kali untuk menstabilkan sistem sarafmu.',
    modality: 'passive'
  },
  {
    id: '478_breathing',
    category: 'breathing',
    title: 'Teknik Napas 4-7-8',
    duration_minutes: 5,
    for_moods: ['cemas', 'stres', 'lelah', 'sulit tidur'],
    instruction: 'Tarik napas melalui hidung dalam 4 hitungan. Tahan napas selama 7 hitungan. Buang napas kuat-kuat melalui mulut dengan suara "whoosh" selama 8 hitungan. Ini adalah obat penenang alami untuk sistem saraf. Lakukan setidaknya 4 siklus.',
    modality: 'passive'
  },
  {
    id: 'belly_breathing',
    category: 'breathing',
    title: 'Napas Perut (Abdominal Breathing)',
    duration_minutes: 3,
    for_moods: ['lelah', 'stres', 'cemas'],
    instruction: 'Letakkan satu tangan di dada dan satu di perut. Tarik napas dalam melalui hidung sehingga perutmu mendorong tanganmu ke depan, sementara dada tetap tenang. Buang napas perlahan melalui bibir yang menguncup. Ini membantu paru-paru bekerja maksimal dan menenangkan pikiran.',
    modality: 'passive'
  },
  {
    id: 'sigh_breathing',
    category: 'breathing',
    title: 'Napas Lega (Cyclic Sighing)',
    duration_minutes: 2,
    for_moods: ['panik', 'cemas', 'tegang'],
    instruction: 'Tarik napas dalam melalui hidung, lalu segera tambahkan satu tarikan napas pendek lagi di atasnya untuk mengembangkan paru-paru sepenuhnya. Kemudian, lepaskan napas melalui mulut secara perlahan dan panjang sampai habis. Ulangi 3-5 kali untuk menurunkan detak jantung secara instan.',
    modality: 'passive'
  },

  // Kategori 2 - GROUNDING
  {
    id: '54321_senses',
    category: 'grounding',
    title: 'Metode 5-4-3-2-1 Senses',
    duration_minutes: 5,
    for_moods: ['cemas', 'panik', 'overwhelmed', 'bingung'],
    instruction: 'Sebutkan 5 benda yang bisa kamu lihat, 4 hal yang bisa kamu sentuh teksturnya, 3 suara yang bisa kamu dengar saat ini, 2 aroma yang bisa kamu cium, dan 1 hal yang bisa kamu rasakan atau syukuri. Latihan ini menarikmu kembali ke momen saat ini dari pikiran yang melayang.',
    modality: 'reflective'
  },
  {
    id: 'body_anchoring',
    category: 'grounding',
    title: 'Jangkar Tubuh (Body Anchoring)',
    duration_minutes: 3,
    for_moods: ['anxiety', 'overwhelmed', 'marah'],
    instruction: 'Berdiri atau duduk tegak. Tekankan telapak kakimu kuat-kuat ke lantai. Rasakan gravitasi menarikmu ke bawah dan dukungan dari bumi di bawah kaki. Tekankan kedua telapak tanganmu bersamaan atau remas pinggiran kursi. Ucapkan dalam hati: "Aku di sini, aku aman, aku berpijak."',
    modality: 'active'
  },
  {
    id: 'cold_water_reset',
    category: 'grounding',
    title: 'Reset Air Dingin',
    duration_minutes: 2,
    for_moods: ['panik', 'marah', 'overwhelmed'],
    instruction: 'Pergilah ke wastafel dan basuh wajahmu dengan air sedingin mungkin, atau tempelkan es batu ke pergelangan tangan atau leher belakang. Suhu dingin yang mendadak akan memicu "Mammalian Dive Reflex" yang secara biologis menurunkan detak jantung dan menghentikan badai emosi.',
    modality: 'active'
  },
  {
    id: 'name_whats_real',
    category: 'grounding',
    title: 'Sebutkan Realita',
    duration_minutes: 2,
    for_moods: ['cemas', 'stres', 'bingung'],
    instruction: 'Sebutkan 3 fakta konkret yang tidak bisa didebat saat ini. Contoh: "Namaku adalah [Nama]", "Aku sedang berada di dalam kamar", "Sepatuku berwarna hitam". Ini membantu otak logis mengambil alih kendali dari bagian otak emosional yang sedang reaktif.',
    modality: 'verbal'
  },

  // Kategori 3 - BODY AWARENESS
  {
    id: 'body_scan',
    category: 'body_awareness',
    title: 'Pemindaian Tubuh (Body Scan)',
    duration_minutes: 7,
    for_moods: ['lelah', 'tegang', 'stres', 'sedih'],
    instruction: 'Tutup matamu dan arahkan perhatian ke ujung jempol kaki. Perlahan gerakkan perhatianmu ke atas melalui pergelangan kaki, betis, paha, perut, hingga kepala. Perhatikan area yang terasa tegang tanpa menghakiminya, cukup "sapa" bagian tersebut dengan napasmu.',
    modality: 'passive'
  },
  {
    id: 'progressive_relaxation',
    category: 'body_awareness',
    title: 'Relaksasi Otot Progresif',
    duration_minutes: 6,
    for_moods: ['tegang', 'marah', 'stres'],
    instruction: 'Kencangkan otot tanganmu sekuat tenaga selama 5 detik, lalu lepaskan seketika. Rasakan perbedaan antara tegang dan rileks. Lakukan hal yang sama pada bahu, wajah, perut, dan kaki. Ini melatih tubuh untuk mengenali dan melepaskan ketegangan fisik yang tidak disadari.',
    modality: 'active'
  },
  {
    id: 'gentle_stretch',
    category: 'body_awareness',
    title: 'Peregangan Lembut',
    duration_minutes: 4,
    for_moods: ['lelah', 'kaku', 'stres'],
    instruction: 'Angkat kedua tanganmu tinggi ke langit sejauh mungkin seolah sedang memetik bintang. Tahan sebentar, lalu biarkan tubuh bagian atas membungkuk perlahan ke arah lantai. Biarkan kepala dan tangan terasa berat seperti boneka kain. Bernapaslah dalam-dalam saat di posisi bawah.',
    modality: 'active'
  },
  {
    id: 'mindful_walking',
    category: 'body_awareness',
    title: 'Berjalan Sadar',
    duration_minutes: 5,
    for_moods: ['overthinking', 'stres'],
    instruction: 'Berjalanlah perlahan di dalam ruangan. Perhatikan setiap sensasi: bagaimana tumit menyentuh lantai, bagaimana berat badan berpindah ke telapak kaki, dan bagaimana jari kaki mendorong untuk langkah berikutnya. Jadikan setiap langkah sebagai satu-satunya fokusmu saat ini.',
    modality: 'active'
  },

  // Kategori 4 - SELF-COMPASSION
  {
    id: 'letter_to_self',
    category: 'self_compassion',
    title: 'Surat Sayu untuk Diri',
    duration_minutes: 6,
    for_moods: ['kecewa', 'sedih', 'self-critical', 'gagal'],
    instruction: 'Ambil waktu sejenak untuk memikirkan dirimu sebagai seorang sahabat kecil yang sedang kesulitan. Tuliskan dalam pikiranmu (atau di atas kertas) kata-kata penghiburan yang akan kamu berikan padanya. Akui bahwa kamu sudah melakukan yang terbaik dengan apa yang kamu tahu saat itu.',
    modality: 'reflective'
  },
  {
    id: 'hand_on_heart',
    category: 'self_compassion',
    title: 'Tangan di Atas Jantung',
    duration_minutes: 3,
    for_moods: ['sedih', 'cemas', 'kecewa'],
    instruction: 'Letakkan satu atau kedua telapak tanganmu di tengah dada. Rasakan kehangatan dan tekanan lembut dari tanganmu. Tarik napas dan bayangkan napas itu masuk langsung ke area jantungmu. Ucapkan pelan: "Momen ini sulit bagi saya, namun saya memilih untuk tetap baik pada diri sendiri."',
    modality: 'active'
  },
  {
    id: 'common_humanity',
    category: 'self_compassion',
    title: 'Pengingat Kemanusiaan',
    duration_minutes: 3,
    for_moods: ['gagal', 'sedih', 'kesepian'],
    instruction: 'Ingatkan dirimu bahwa apa yang kamu rasakan saat ini—kegagalan, rasa malu, atau kesedihan—adalah bagian dari pengalaman universal manusia. Kamu tidak sendirian. Jutaan orang sedang merasakan hal serupa saat ini. Kita semua tidak sempurna, dan itu tidak apa-apa.',
    modality: 'reflective'
  },
  {
    id: 'kindness_phrases',
    category: 'self_compassion',
    title: 'Afirmasi Kelembutan',
    duration_minutes: 3,
    for_moods: ['self-critical', 'lelah', 'stres'],
    instruction: 'Ulangi kalimat ini dalam hati dengan perlahan: "Semoga aku merasa aman. Semoga aku merasa tenang. Semoga aku menerima diriku apa adanya. Semoga aku hidup dengan kemudahan." Biarkan setiap kalimat meresap ke dalam perasaanmu seiring hembusan napas.',
    modality: 'verbal'
  },

  // Kategori 5 - COGNITIVE RELEASE
  {
    id: 'brain_dump',
    category: 'cognitive_release',
    title: 'Brain Dump (Kuras Pikiran)',
    duration_minutes: 5,
    for_moods: ['overthinking', 'bingung', 'overwhelmed', 'stres'],
    instruction: 'Tuliskan secara cepat segala hal yang ada di pikiranmu saat ini tanpa mempedulikan tata bahasa atau struktur. Bayangkan kamu sedang memindahkan beban dari kepalamu ke atas kertas/layar. Lakukan sampai kamu merasa "kosong" dan lebih ringan.',
    modality: 'active'
  },
  {
    id: 'worry_postponement',
    category: 'cognitive_release',
    title: 'Penundaan Rasa Khawatir',
    duration_minutes: 4,
    for_moods: ['cemas', 'overthinking', 'stres'],
    instruction: 'Akui kekhawatiran yang muncul, tapi katakan padanya: "Terima kasih sudah mengingatkan, tapi aku akan memikirkanmu jam 5 sore nanti selama 15 menit saja." Untuk saat ini, kembalilah fokus pada tugas kecil di depan matamu. Jadwalkan waktu khusus untuk "sesi khawatir" itu.',
    modality: 'reflective'
  },
  {
    id: 'thought_defusion',
    category: 'cognitive_release',
    title: 'Pemisahan Pikiran (Defusion)',
    duration_minutes: 3,
    for_moods: ['overthinking', 'kecewa', 'self-critical'],
    instruction: 'Alih-alih berkata "Aku gagal", ubahlah kalimatnya menjadi "Aku menyadari bahwa aku sedang memiliki pikiran bahwa aku gagal". Lihatlah pikiranmu sebagai awan yang lewat di langit atau mobil yang melintas di jalan, bukan sebagai kebenaran mutlak tentang dirimu.',
    modality: 'reflective'
  },
  {
    id: 'one_small_action',
    category: 'cognitive_release',
    title: 'Identifikasi Satu Langkah Kecil',
    duration_minutes: 3,
    for_moods: ['stres', 'overwhelmed', 'bingung'],
    instruction: 'Dari sekian banyak hal yang mengganggumu, pilih satu saja hal terkecil yang bisa kamu selesaikan dalam 2 menit ke depan. Contoh: Membalas satu pesan pendek, merapikan meja, atau minum air putih. Fokuslah hanya pada langkah kecil ini untuk memecah rasa kewalahanmu.',
    modality: 'active'
  },

  // Kategori 6 - EXPRESSIVE RELEASE
  {
    id: 'free_write',
    category: 'expressive_release',
    title: 'Menulis Bebas Tanpa Filter',
    duration_minutes: 5,
    for_moods: ['marah', 'frustasi', 'sedih'],
    instruction: 'Tuliskan kemarahan atau kekecewaanmu secara jujur, sekasar atau seberantakan apapun itu. Jangan diedit. Tujuannya adalah mengeluarkan energi emosional dari dalam tubuh ke bentuk fisik di luar tubuh. Jangan khawatir tentang logikanya, biarkan semua keluar.',
    modality: 'active'
  },
  {
    id: 'movement_release',
    category: 'expressive_release',
    title: 'Pelepasan Melalui Gerak',
    duration_minutes: 3,
    for_moods: ['marah', 'frustasi', 'tegang', 'energi berlebih'],
    instruction: 'Goyangkan seluruh tubuhmu sekuat tenaga selama 1 menit, atau lakukan gerakan seperti sedang meninju udara secara terkontrol. Kamu juga bisa melakukan jalan cepat di tempat. Gunakan otot-ototmu untuk menyalurkan energi kemarahan atau frustasi yang terperangkap.',
    modality: 'active'
  },
  {
    id: 'tear_it_up',
    category: 'expressive_release',
    title: 'Tulis dan Hancurkan',
    duration_minutes: 4,
    for_moods: ['marah', 'kecewa', 'frustasi'],
    instruction: 'Tuliskan nama orang, situasi, atau perasaan yang membuatmu marah di secarik kertas. Setelah selesai, robek-robek kertas itu sekecil mungkin dengan penuh kesadaran. Rasakan kepuasan saat melihat masalah tersebut hancur menjadi serpihan yang tidak lagi utuh.',
    modality: 'active'
  },
  {
    id: 'verbal_release',
    category: 'expressive_release',
    title: 'Suarakan Keluar',
    duration_minutes: 2,
    for_moods: ['frustasi', 'marah', 'tegang'],
    instruction: 'Jika memungkinkan, teriaklah ke dalam bantal atau buatlah suara mengerang yang panjang dan berat dari dalam perut. Suara adalah getaran yang bisa membantu melepaskan ketegangan saraf di area leher dan dada yang sering terkunci saat kita emosional.',
    modality: 'verbal'
  },

  // Kategori 7 - REFLECTION
  {
    id: 'three_whys',
    category: 'reflection',
    title: 'Tiga Lapis Pertanyaan (3 Whys)',
    duration_minutes: 5,
    for_moods: ['bingung', 'sedih', 'penasaran'],
    instruction: 'Tanyakan "Kenapa aku merasa seperti ini?" setelah setiap jawaban yang muncul, tanyakan lagi "Kenapa?" sampai 3 lapis. Biasanya di lapis ketiga kamu akan menemukan akar kebutuhan atau nilai yang sedang tidak terpenuhi di balik emosimu saat ini.',
    modality: 'reflective'
  },
  {
    id: 'best_friend_perspective',
    category: 'reflection',
    title: 'Sudut Pandang Sahabat',
    duration_minutes: 4,
    for_moods: ['bingung', 'kecewa', 'stres'],
    instruction: 'Jika sahabat baikmu datang kepadamu dengan masalah yang persis sama dengan yang kamu alami hari ini, saran bijak apa yang akan kamu berikan padanya? Kita seringkali lebih bijak untuk orang lain daripada untuk diri sendiri. Cobalah dengarkan saranmu itu untuk dirimu sendiri.',
    modality: 'reflective'
  },
  {
    id: 'future_self_letter',
    category: 'reflection',
    title: 'Pesan dari Dirimu di Masa Depan',
    duration_minutes: 5,
    for_moods: ['cemas', 'stres', 'gagal'],
    instruction: 'Bayangkan dirimu 5 tahun dari sekarang, di saat masalah hari ini sudah menjadi kenangan lama yang tak berarti. Apa yang akan dikatakan "Dirimu yang lebih dewasa" itu kepadamu sekarang? Mungkin dia akan berkata: "Semua ini akan baik-baik saja, kamu lebih kuat dari yang kamu duga."',
    modality: 'reflective'
  },
  {
    id: 'values_check',
    category: 'reflection',
    title: 'Audit Nilai Diri',
    duration_minutes: 4,
    for_moods: ['bingung', 'kosong', 'stres'],
    instruction: 'Pikirkan 3 hal yang paling penting bagimu dalam hidup (misal: integritas, kasih sayang, kebebasan). Apakah stres atau masalah yang kamu hadapi hari ini berkaitan dengan salah satu nilai itu? Memahami hubungan ini membantu memberikan makna pada kesulitanmu.',
    modality: 'reflective'
  },

  // Kategori 8 - GRATITUDE
  {
    id: 'three_good_things',
    category: 'gratitude',
    title: 'Tiga Hal Baik (3 Good Things)',
    duration_minutes: 3,
    for_moods: ['senang', 'puas', 'yukur', 'biasa saja'],
    instruction: 'Sebutkan 3 hal kecil yang berjalan baik hari ini, sekecil apapun itu. Misal: kopi yang enak, cuaca yang cerah, atau bertemu teman lama. Tuliskan "Kenapa hal itu bisa terjadi?". Ini melatih otak untuk mulai mencari sisi positif di tengah rutinitas.',
    modality: 'reflective'
  },
  {
    id: 'sensory_savoring',
    category: 'gratitude',
    title: 'Menikmati Panca Indera',
    duration_minutes: 4,
    for_moods: ['senang', 'damai'],
    instruction: 'Pilih satu pengalaman menyenangkan saat ini (misal: minum teh atau mendengarkan lagu). Fokuslah sepenuhnya pada sensasinya: suhunya, aromanya, teksturnya, atau melodinya. Jangan buru-buru menyelesaikannya. Biarkan rasa senang itu "mendarat" dan meresap lama di tubuhmu.',
    modality: 'passive'
  },
  {
    id: 'send_kindness',
    category: 'gratitude',
    title: 'Kirimkan Kebaikan Mental',
    duration_minutes: 3,
    for_moods: ['syukur', 'senang', 'damai'],
    instruction: 'Bayangkan seseorang yang kamu sayangi, lalu bayangkan seseorang yang netral bagimu. Ucapkan dalam hati: "Semoga kamu bahagia, semoga kamu sehat, semoga kamu bebas dari penderitaan." Mengharapkan kebaikan bagi orang lain terbukti meningkatkan kebahagiaan pengirimnya.',
    modality: 'reflective'
  },
  {
    id: 'letter_of_appreciation',
    category: 'gratitude',
    title: 'Apresiasi Diri Sendiri',
    duration_minutes: 4,
    for_moods: ['syukur', 'puas', 'bangga'],
    instruction: 'Sebutkan satu bagian dari tubuhmu atau satu sifat karaktermu yang sangat membantumu hari ini. Katakan "Terima kasih sudah bertahan/bekerja keras". Menghargai instrumen kehidupanmu sendiri adalah bentuk tertinggi dari rasa syukur.',
    modality: 'verbal'
  }
];
