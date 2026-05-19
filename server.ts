import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import * as archiverNamespace from "archiver";

// @ts-ignore
const archiver = archiverNamespace.default || archiverNamespace;

dotenv.config();

// Robust shim for __dirname and __filename to support both ESM (tsx) and CJS (bundled)
const currentFilename = typeof import.meta !== 'undefined' && import.meta.url 
  ? fileURLToPath(import.meta.url) 
  : (typeof __filename !== 'undefined' ? __filename : '');

const currentDirname = currentFilename 
  ? path.dirname(currentFilename) 
  : (typeof __dirname !== 'undefined' ? __dirname : process.cwd());

async function startServer() {
  const mode = process.env.NODE_ENV || 'development';
  console.log(`Starting Ruang Bertumbuh server in ${mode} mode...`);
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.error("CRITICAL ERROR: GEMINI_API_KEY is not set or is using the placeholder value. AI features will fail.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const app = express();
  const PORT = 3000;

  app.get("/health", (req, res) => {
    res.status(200).send("OK");
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      ai_configured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
    });
  });

  app.use(express.json({ limit: '10mb' }));

  // EXPORT PROJECT AS ZIP
  app.get("/api/download-project", (req, res) => {
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    res.attachment('project.zip');

    archive.on('error', (err) => {
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Add files and directories to the zip
    // Excluding node_modules and dist is important
    archive.glob('**/*', {
      ignore: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        'project.zip',
        'package-lock.json'
      ]
    });

    archive.finalize();
  });

  // Helper to parse JSON from potential markdown blocks
  const parseAIJSON = (text: string | undefined) => {
    try {
      if (!text) return {};
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", text);
      return {}; // Return empty object on parse failure instead of throwing
    }
  };

  // AI ROUTES
  app.post("/api/analyze-reflection", async (req, res) => {
    try {
      const { input, imageUrl } = req.body;
      
      let parts: any[] = [];
      if (typeof input === 'string') {
        parts.push({ text: `Konteks jurnal user: ${input}` });
      } else {
        parts.push({
          inlineData: {
            mimeType: input.mimeType,
            data: input.data
          }
        });
        parts.push({ text: "Analisis input suara ini." });
      }

      if (imageUrl) {
        const match = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
          parts.push({ text: "Lihat juga foto yang saya lampirkan ini untuk memahami konteks perasaan saya lebih dalam." });
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          systemInstruction: MIRROR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
        },
      });

      res.json(parseAIJSON(response.text));
    } catch (error: any) {
      console.error("Gemini Analyze Reflection Error:", error);
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        res.status(429).json({ error: "Maaf, kuota harian AI Ruang Bertumbuh sudah habis. Silakan coba lagi besok ya!" });
      } else if (errorMessage.includes("401") || errorMessage.includes("API key") || errorMessage.includes("PERMISSION_DENIED")) {
        res.status(401).json({ error: "Kunci API tidak valid atau belum dikonfigurasi. Harap periksa setelan AI Studio di panel Secrets." });
      } else {
        res.status(500).json({ error: `Gagal menganalisis jurnal: ${errorMessage}` });
      }
    }
  });

  app.post("/api/analyze-strengths", async (req, res) => {
    try {
      const { narratives } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: narratives }] }],
        config: {
          systemInstruction: STRENGTH_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
        },
      });

      res.json(parseAIJSON(response.text));
    } catch (error: any) {
      console.error("Gemini Analyze Strengths Error:", error);
      const errorMessage = error?.message || String(error);

      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        res.status(429).json({ error: "Maaf, kuota harian analisis kekuatan sudah habis. Silakan coba lagi besok ya!" });
      } else if (errorMessage.includes("401") || errorMessage.includes("API key") || errorMessage.includes("PERMISSION_DENIED")) {
        res.status(401).json({ error: "Kunci API tidak valid atau belum dikonfigurasi. Harap periksa setelan AI Studio di panel Secrets." });
      } else {
        res.status(500).json({ error: `Gagal menganalisis kekuatan: ${errorMessage}` });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware loaded (development mode)");
    
    // Add a catch-all route for SPA in development
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // Only handle if it's not an API or health route (those should have been handled above)
        if (url.startsWith('/api/') || url === '/health' || url === '/api/health') {
          return next();
        }
        
        let template = fs.readFileSync(path.resolve(currentDirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // In production, we serve from the 'dist' directory.
    // When bundled as dist/server.cjs, __dirname is 'dist' (in the container /workspace/dist).
    // Otherwise it's the directory of server.ts.
    const isBundled = currentFilename.endsWith('.cjs');
    const distPath = isBundled ? currentDirname : path.join(process.cwd(), 'dist');
    
    console.log(`Production mode: serving static files from ${distPath}`);
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          console.error(`ERROR: index.html not found at ${indexPath}`);
          res.status(404).send("Application shell not found. Please check build output.");
        }
      });
    } else {
      console.error(`ERROR: dist directory not found at ${distPath}`);
      app.get('*', (req, res) => {
        res.status(500).send("Application assets not found. Build may have failed.");
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on 0.0.0.0:${PORT} (NODE_ENV: ${process.env.NODE_ENV})`);
  });
}

startServer().catch(err => {
  console.error("Critical server startup error:", err);
  process.exit(1);
});

const MIRROR_SYSTEM_INSTRUCTION = `Kamu adalah AI companion di app "Ruang Bertumbuh" — tempat orang menuangkan apa yang mereka rasakan atau alami hari ini. Penting: tidak semua input adalah curhat emosional yang berat. Banyak orang hanya ingin sambat, cerita ringan, atau berbagi kejadian sehari-hari.

LANGKAH 1 — KLASIFIKASI INPUT
A. CURHAT BERAT (konflik relasi serius, kesedihan dalam, krisis, kehilangan, trauma, anxiety berat)
B. CURHAT RINGAN / SAMBAT (keluhan sehari-hari, kekesalan ringan, kelelahan biasa)
C. KELUHAN FISIK (sakit ringan, kecelakaan kecil, lapar, pusing)
D. CERITA NETRAL / OBSERVASI (berbagi kejadian tanpa muatan emosi kuat)
E. CERITA POSITIF / GEMBIRA (pencapaian, momen senang, syukur)
F. DISTRESS / KRISIS (keinginan menyakiti diri, ideasi bunuh diri) -> Aktifkan safety layer.

LANGKAH 2 — DETEKSI MOOD
Mood harus PROPORSIONAL (Senang, Bersyukur, Tenang, Netral, Penasaran, Kesal, Lelah, Cemas, Bingung, Kecewa, Sedih, Marah, Kesepian, Hampa).

LANGKAH 3 — PILIH KATEGORI MINDFULNESS (Jika Tampilkan_mindfulness: true)
1. 'breathing': Untuk cemas, panik, stres akut.
2. 'grounding': Untuk anxiety, overwhelmed, disconnect.
3. 'body_awareness': Untuk lelah, tegang, fisik tidak nyaman.
4. 'self_compassion': Untuk sedih, kecewa diri, self-critical.
5. 'cognitive_release': Untuk overthinking, kepala penuh, bingung.
6. 'expressive_release': Untuk marah, frustasi, emotional buildup.
7. 'reflection': Untuk bingung diri, refleksi, growth.
8. 'gratitude': Untuk cerita positif, syukur, momen senang.

LANGKAH 4 — ATURAN RESPON
- Respon harus empatik dan proporsional dengan intensitas input.
- Kategori A & F wajib menyertakan mindfulness. Kategori lain opsional tapi disarankan (terutama E untuk gratitude).

Output dalam JSON:
{
  "kategori": "A" | "B" | "C" | "D" | "E" | "F",
  "mood": "string",
  "respon": "string",
  "tampilkan_mindfulness": boolean,
  "kategori_mindfulness": "breathing" | "grounding" | "body_awareness" | "self_compassion" | "cognitive_release" | "expressive_release" | "reflection" | "gratitude" | null
}`;

const STRENGTH_SYSTEM_INSTRUCTION = `Role: Kamu adalah "Strength Spotter". Tugasmu adalah melihat pola kebaikan dan nilai diri dari catatan harian seseorang.
1. Fokus pada respons user terhadap masalah: Apakah mereka sabar? Jujur? Tangguh?
2. Ekstrak 3 "Core Values".
3. Tuliskan sebuah "Surat Apresiasi" singkat (3-5 kalimat).
4. Analisis pola emosi dominan dengan satu kalimat puitis.
5. Ekstrak 4-5 kata kunci dengan bobot (1-5).

Output harus dalam JSON:
{
  "core_values": ["string"],
  "appreciation_letter": "string",
  "emotion_pattern": "string",
  "frequent_words": [{"word": "string", "weight": number}]
}`;
