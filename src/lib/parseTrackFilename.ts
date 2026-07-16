// lib/parseTrackFilename.ts

export type ParsedTrack = {
  albumCode: string;        // e.g. MLA4033
  trackNumber: number;      // e.g. 10
  rawTitle: string;         // everything between trck{n}_ and the first descriptor word
  suggestedTitle: string;   // cleaned up version of rawTitle
  bpm: number | null;       // e.g. 130
  energy: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" | null;
  mood: string[];           // extracted mood words
  format: string;           // aif, wav, mp3, flac
  originalFilename: string; // untouched original
};

// ── Descriptor words that signal the title has ended ─────────────────────────
// These are tempo/descriptor words found in your filenames
const TEMPO_WORDS = [
  "very fast", "med fast", "fast", "medium", "slow", "up beat", "upbeat",
];

// Mood/descriptor words to extract from the descriptor section
const MOOD_WORDS = [
  "uplifting", "upbeat", "positive", "inspiring", "inspirational", "inspired",
  "driving", "driven", "powerful", "energetic", "energy",
  "happy", "joyful", "celebratory", "triumphant",
  "dark", "tense", "mysterious", "eerie", "brooding",
  "relaxed", "laid back", "laid-back", "peaceful", "soothing", "dreamy",
  "intense", "pumping", "urgent", "gritty", "propulsive",
  "nostalgic", "unforgettable", "emotional", "melancholic",
  "ambient", "cinematic", "epic", "stadium", "rave", "club", "disco",
  "confidence", "certainty", "morale", "determination",
  "background", "foreground", "filler", "magazine",
];

// Map tempo words to energy enum
const TEMPO_TO_ENERGY: Record<string, ParsedTrack["energy"]> = {
  "very fast": "VERY_HIGH",
  "med fast":  "HIGH",
  "fast":      "HIGH",
  "up beat":   "HIGH",
  "upbeat":    "HIGH",
  "medium":    "MEDIUM",
  "slow":      "LOW",
};

// Canonical mood label mapping — normalise variations to a clean label
const MOOD_CANONICAL: Record<string, string> = {
  "inspiring":       "Inspiring",
  "inspirational":   "Inspiring",
  "inspired":        "Inspiring",
  "uplifting":       "Uplifting",
  "upbeat":          "Energetic",
  "positive":        "Positive",
  "driving":         "Driving",
  "driven":          "Driving",
  "powerful":        "Powerful",
  "energetic":       "Energetic",
  "energy":          "Energetic",
  "happy":           "Happy",
  "joyful":          "Happy",
  "celebratory":     "Celebratory",
  "triumphant":      "Triumphant",
  "dark":            "Dark",
  "tense":           "Tense",
  "mysterious":      "Mysterious",
  "eerie":           "Eerie",
  "brooding":        "Brooding",
  "relaxed":         "Relaxed",
  "laid back":       "Relaxed",
  "laid-back":       "Relaxed",
  "peaceful":        "Peaceful",
  "soothing":        "Soothing",
  "dreamy":          "Dreamy",
  "intense":         "Intense",
  "pumping":         "Pumping",
  "urgent":          "Urgent",
  "gritty":          "Intense",
  "propulsive":      "Driving",
  "nostalgic":       "Nostalgic",
  "unforgettable":   "Nostalgic",
  "emotional":       "Emotional",
  "melancholic":     "Melancholic",
  "ambient":         "Dreamy",
  "cinematic":       "Cinematic",
  "epic":            "Powerful",
  "stadium":         "Powerful",
  "rave":            "Energetic",
  "club":            "Energetic",
  "disco":           "Celebratory",
  "confidence":      "Inspiring",
  "certainty":       "Inspiring",
  "morale":          "Uplifting",
  "determination":   "Determined",
  "background":      "", // not a mood — skip
  "foreground":      "",
  "filler":          "",
  "magazine":        "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanTitle(raw: string): string {
  return raw
    .replace(/\d+$/, "")          // remove trailing numbers like "Days2"
    .replace(/[._]+/g, " ")       // dots and underscores → spaces
    .replace(/\s+/g, " ")         // collapse multiple spaces
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Title Case
}

function extractBpm(str: string): number | null {
  const match = str.match(/bpm\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function extractEnergy(str: string): ParsedTrack["energy"] {
  const lower = str.toLowerCase();
  for (const [tempo, energy] of Object.entries(TEMPO_TO_ENERGY)) {
    if (lower.includes(tempo)) return energy;
  }
  return null;
}

function extractMood(str: string): string[] {
  const lower = str.toLowerCase();
  const found = new Set<string>();

  for (const word of MOOD_WORDS) {
    if (lower.includes(word)) {
      const canonical = MOOD_CANONICAL[word];
      if (canonical) found.add(canonical);
    }
  }

  return Array.from(found);
}

// Find the index in the string where the title ends and descriptors begin
// We look for the first tempo/descriptor word
function findTitleEnd(str: string): number {
  const lower = str.toLowerCase();

  // Check multi-word tempo phrases first (order matters — "very fast" before "fast")
  for (const tempo of TEMPO_WORDS) {
    const idx = lower.indexOf(tempo);
    if (idx !== -1) return idx;
  }

  // Fallback — look for any mood word appearing early
  for (const mood of MOOD_WORDS) {
    const idx = lower.indexOf(mood);
    if (idx !== -1 && idx < 40) return idx; // only if it appears early enough to be a descriptor
  }

  return str.length; // no split found — whole thing is the title
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseTrackFilename(filename: string): ParsedTrack {
  const originalFilename = filename;

  // Strip extension
  const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
  const format = extMatch ? extMatch[1].toLowerCase() : "mp3";
  filename = filename.replace(/\.[^/.]+$/, "");

  // Extract album code — everything before the first underscore
  // e.g. MLA4033
  const albumCodeMatch = filename.match(/^([A-Z0-9]+)_/i);
  const albumCode = albumCodeMatch ? albumCodeMatch[1].toUpperCase() : "";

  // Extract track number — trck{n}
  const trackNumMatch = filename.match(/_trck(\d+)_/i);
  const trackNumber = trackNumMatch ? parseInt(trackNumMatch[1], 10) : 0;

  // Extract everything after the second underscore (after trck{n}_)
  // This is the raw descriptor string containing title + metadata
  const afterTrackNum = filename.replace(/^.*?_trck\d+_/i, "");

  // Split title from descriptors
  const titleEnd = findTitleEnd(afterTrackNum);
  const rawTitle = afterTrackNum.slice(0, titleEnd).trim();
  const descriptors = afterTrackNum.slice(titleEnd);

  // Parse from the full remaining string (descriptors + bpm)
  const bpm = extractBpm(descriptors);
  const energy = extractEnergy(descriptors);
  const mood = extractMood(descriptors);

  return {
    albumCode,
    trackNumber,
    rawTitle,
    suggestedTitle: cleanTitle(rawTitle),
    bpm,
    energy,
    mood,
    format,
    originalFilename,
  };
}

// ── Batch parser — use this in the upload component ──────────────────────────

export function parseTrackFiles(files: File[]): ParsedTrack[] {
  return files
    .map((f) => parseTrackFilename(f.name))
    .sort((a, b) => a.trackNumber - b.trackNumber);
}