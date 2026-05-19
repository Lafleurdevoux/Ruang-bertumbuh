export interface MindfulnessResponse {
  kategori: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  mood: string;
  respon: string;
  tampilkan_mindfulness: boolean;
  kategori_mindfulness: 'breathing' | 'grounding' | 'body_awareness' | 'self_compassion' | 'cognitive_release' | 'expressive_release' | 'reflection' | 'gratitude' | null;
  aktivitas_mindfulness?: {
    title: string;
    duration_minutes: number;
    instruction: string;
  } | null;
}

export interface StrengthSpotterResponse {
  core_values: string[];
  appreciation_letter: string;
  emotion_pattern: string;
  frequent_words: { word: string; weight: number }[];
}

export async function analyzeReflection(input: string | { mimeType: string, data: string }, imageUrl?: string): Promise<MindfulnessResponse> {
  const response = await fetch("/api/analyze-reflection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, imageUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal menganalisis jurnal. Coba lagi?");
  }

  return response.json();
}

export async function analyzeStrengths(narratives: string): Promise<StrengthSpotterResponse> {
  const response = await fetch("/api/analyze-strengths", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ narratives }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal menganalisis kekuatan.");
  }

  return response.json();
}
