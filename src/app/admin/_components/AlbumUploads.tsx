"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CATEGORIES, GENRES } from "@/types/music";
import { parseTrackFiles, ParsedTrack } from "@/lib/parseTrackFilename";
import {
  uploadAlbum,
  TrackUploadInput,
  AlbumUploadInput,
  UploadProgress,
} from "@/lib/music-upload";
import {
  Upload,
  Music,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  X,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

const MOODS = [
  "Uplifting",
  "Positive",
  "Inspiring",
  "Driving",
  "Powerful",
  "Energetic",
  "Happy",
  "Celebratory",
  "Triumphant",
  "Playful",
  "Optimistic",
  "Dark",
  "Tense",
  "Mysterious",
  "Eerie",
  "Brooding",
  "Peaceful",
  "Relaxed",
  "Dreamy",
  "Soothing",
  "Meditative",
  "Intense",
  "Pumping",
  "Urgent",
  "Emotional",
  "Nostalgic",
  "Romantic",
  "Melancholic",
  "Bittersweet",
  "Neutral",
  "Focused",
  "Determined",
  "Cinematic",
  "Corporate",
  "Informational",
];

const INSTRUMENTS = [
  "Piano",
  "Strings",
  "Violin",
  "Cello",
  "Harp",
  "Choir",
  "Drums",
  "Percussion",
  "Hi-Hats",
  "Congas",
  "Shakers",
  "Claps",
  "Synth",
  "808",
  "Pad",
  "Arp",
  "Sub Bass",
  "Vinyl Crackle",
  "Trumpet",
  "Saxophone",
  "Flute",
  "French Horn",
  "Trombone",
  "Oboe",
  "Guitar (Acoustic)",
  "Guitar (Electric)",
  "Bass Guitar",
  "Organ",
  "Rhodes",
  "Marimba",
  "Vibraphone",
  "Harpsichord",
  "Kora",
  "Mbira",
  "Balafon",
];

const USAGE_TAGS = [
  "Film",
  "Documentary",
  "Short Film",
  "Trailer",
  "Advertising",
  "Product Launch",
  "Brand Identity",
  "Fashion Show",
  "Social Media",
  "YouTube",
  "Reel",
  "Podcast",
  "Corporate Event",
  "Awards Ceremony",
  "Conference",
  "Sports Event",
  "TV Show",
  "Radio",
  "News",
  "Sports Broadcast",
  "Game",
  "Meditation App",
  "E-Learning",
];

const VOCALS = [
  "NONE",
  "MALE",
  "FEMALE",
  "CHOIR",
  "SPOKEN_WORD",
  "CHANT",
  "AD_LIBS_ONLY",
] as const;
const VERSIONS = [
  "FULL_MIX",
  "UNDERSCORE",
  "STEMS",
  "EDIT_60",
  "EDIT_30",
  "STING",
  "LOOP",
] as const;
const ENERGIES = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"] as const;
const LIC_TIERS = ["FREE", "STANDARD", "PREMIUM", "EXCLUSIVE"] as const;

type EditableTrack = TrackUploadInput & {
  parsed: ParsedTrack;
  expanded: boolean;
};

// ── Multi-select tag pill component ───────────────────────────────────────────

function TagPills({
  options,
  selected,
  onChange,
  max = 999,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
    else if (selected.length < max) onChange([...selected, v]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          style={{
            fontFamily: "Manrope,sans-serif",
            fontSize: ".6rem",
            fontWeight: 600,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            padding: ".25rem .55rem",
            border: "1px solid",
            borderColor: selected.includes(o) ? "#eb5e28" : "#ccc5b9",
            background: selected.includes(o) ? "#eb5e28" : "transparent",
            color: selected.includes(o) ? "#fffcf2" : "#403d39",
            cursor: "pointer",
            transition: "all .15s",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ── Label + field wrapper ─────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
      <label
        style={{
          fontFamily: "Manrope,sans-serif",
          fontSize: ".6rem",
          fontWeight: 600,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "#403d39",
          opacity: 0.55,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "Manrope,sans-serif",
  fontSize: ".8rem",
  fontWeight: 500,
  color: "#252422",
  background: "#fffcf2",
  border: "1px solid #ccc5b9",
  outline: "none",
  padding: ".6rem .85rem",
  width: "100%",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function AlbumUpload() {
  // ── Step: "form" | "preview" | "uploading" | "done"
  const [step, setStep] = useState<"form" | "preview" | "uploading" | "done">(
    "form",
  );

  // ── Album-level fields
  const [albumData, setAlbumData] = useState<AlbumUploadInput>({
    title: "",
    composer: "Abe Sibiya",
    category: "",
    genre: "",
    description: "",
    releaseDate: "",
    mood: [],
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [cueSheet, setCueSheet] = useState<File | null>(null);

  // ── Track state
  const [trackFiles, setTrackFiles] = useState<File[]>([]);
  const [editableTracks, setEditableTracks] = useState<EditableTrack[]>([]);

  // ── Upload state
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [albumId, setAlbumId] = useState("");

  // ── Handle file selection → parse immediately ─────────────────────────────
  const handleTrackFilesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = Array.from(e.target.files).filter(
        (f) =>
          f.type.startsWith("audio/") ||
          f.name.match(/\.(aif|aiff|wav|mp3|flac|m4a)$/i),
      );
      if (!files.length) return;
      setTrackFiles(files);

      const parsed = parseTrackFiles(files);

      // Map file back to ParsedTrack by track number order
      const sorted = [...files].sort((a, b) => {
        const na =
          parsed.find((p) => p.originalFilename === a.name)?.trackNumber ?? 0;
        const nb =
          parsed.find((p) => p.originalFilename === b.name)?.trackNumber ?? 0;
        return na - nb;
      });

      setEditableTracks(
        sorted.map((file, i) => {
          const p =
            parsed.find((px) => px.originalFilename === file.name) ?? parsed[i];
          return {
            file,
            parsed: p,
            expanded: false,
            title: p.suggestedTitle,
            trackNumber: p.trackNumber || i + 1,
            composer: albumData.composer || "",
            genre: albumData.genre || "",
            category: albumData.category || "",
            mood: p.mood,
            energy: p.energy ?? "HIGH",
            bpm: p.bpm ?? 0,
            musicalKey: "",
            instruments: [],
            vocals: "NONE",
            usageTags: [],
            downloadable: true,
            licenseTier: "FREE",
            version: "FULL_MIX",
            tags: [],
            featured: false,
            newRelease: false,
          } satisfies EditableTrack;
        }),
      );
    },
    [albumData.composer, albumData.genre, albumData.category],
  );

  // ── Update a single track field ───────────────────────────────────────────
  const updateTrack = useCallback(
    (idx: number, patch: Partial<EditableTrack>) => {
      setEditableTracks((prev) =>
        prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  // ── Go to preview step ────────────────────────────────────────────────────
  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      setMessage({ type: "error", text: "Please select a cover image." });
      return;
    }
    if (!trackFiles.length) {
      setMessage({ type: "error", text: "Please select track files." });
      return;
    }
    setMessage({ type: "", text: "" });
    // Inherit album-level composer/genre/category into tracks that haven't been edited
    setEditableTracks((prev) =>
      prev.map((t) => ({
        ...t,
        composer: t.composer || albumData.composer,
        genre: t.genre || albumData.genre,
        category: t.category || albumData.category,
      })),
    );
    setStep("preview");
  };

  // ── Publish ───────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    setStep("uploading");
    setMessage({ type: "", text: "" });
    try {
      const result = await uploadAlbum(
        albumData,
        coverImage!,
        cueSheet,
        editableTracks,
        setUploadProgress,
      );
      setAlbumId(result.albumId);
      setStep("done");
    } catch (err) {
      setMessage({
        type: "error",
        text: `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
      setStep("preview");
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep("form");
    setAlbumData({
      title: "",
      composer: "Abe Sibiya",
      category: "",
      genre: "",
      description: "",
      releaseDate: "",
      mood: [],
    });
    setCoverImage(null);
    setCueSheet(null);
    setTrackFiles([]);
    setEditableTracks([]);
    setUploadProgress([]);
    setMessage({ type: "", text: "" });
    setAlbumId("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Syne:wght@700&family=Manrope:wght@400;500;600&display=swap');
        .au-root *,:after,:before{box-sizing:border-box}
        .au-root { font-family:'Manrope',sans-serif; background:#fffcf2; color:#252422; min-height:100vh; padding:2.5rem; }
        .au-card { max-width:900px; margin:0 auto; }
        .au-h1 { font-family:'Bricolage Grotesque',sans-serif; font-size:2rem; font-weight:800; letter-spacing:-.02em; text-transform:uppercase; color:#252422; margin:0 0 .25rem; }
        .au-h1 em { font-style:normal; color:#eb5e28; }
        .au-sub { font-size:.78rem; color:#403d39; opacity:.55; margin:0 0 2rem; }
        .au-section { border:1px solid #ccc5b9; padding:1.5rem; margin-bottom:1.25rem; }
        .au-section-title { font-family:'Syne',sans-serif; font-size:.7rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#403d39; opacity:.5; margin:0 0 1.25rem; display:flex; align-items:center; gap:.5rem; }
        .au-section-title::before { content:''; display:block; width:16px; height:1px; background:#eb5e28; }
        .au-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .au-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; }
        .au-btn { font-family:'Syne',sans-serif; font-weight:700; font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; border:none; padding:.8rem 1.75rem; cursor:pointer; display:inline-flex; align-items:center; gap:.5rem; transition:background .2s; }
        .au-btn-primary { background:#eb5e28; color:#fffcf2; }
        .au-btn-primary:hover { background:#d44c10; }
        .au-btn-secondary { background:#252422; color:#fffcf2; }
        .au-btn-secondary:hover { background:#403d39; }
        .au-btn-ghost { background:none; color:#403d39; border:1px solid #ccc5b9; }
        .au-btn-ghost:hover { border-color:#eb5e28; color:#eb5e28; }
        .au-btn:disabled { opacity:.4; cursor:not-allowed; }
        .au-file-drop { border:1px dashed #ccc5b9; padding:2rem; text-align:center; cursor:pointer; transition:border-color .2s; }
        .au-file-drop:hover { border-color:#eb5e28; }
        .au-file-drop input { display:none; }
        .au-file-icon { color:#ccc5b9; margin-bottom:.75rem; }
        .au-file-label { font-family:'Syne',sans-serif; font-size:.72rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#403d39; }
        .au-file-sub { font-size:.65rem; color:#403d39; opacity:.45; margin-top:.25rem; }
        .au-file-selected { font-size:.72rem; color:#2d6a4f; font-weight:600; margin-top:.5rem; }
        /* Track card */
        .au-track-card { border:1px solid #ccc5b9; margin-bottom:.5rem; }
        .au-track-header { display:flex; align-items:center; gap:1rem; padding:.85rem 1.25rem; cursor:pointer; transition:background .15s; }
        .au-track-header:hover { background:#f5f0e8; }
        .au-track-num { font-family:'Manrope',sans-serif; font-size:.65rem; font-weight:700; color:#ccc5b9; width:24px; text-align:center; flex-shrink:0; }
        .au-track-title-display { font-family:'Syne',sans-serif; font-size:.82rem; font-weight:700; text-transform:uppercase; color:#252422; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .au-track-badges { display:flex; gap:.3rem; flex-shrink:0; }
        .au-badge { font-family:'Manrope',sans-serif; font-size:.55rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:.2rem .5rem; border:1px solid #ccc5b9; color:#403d39; }
        .au-badge.orange { border-color:#eb5e28; color:#eb5e28; }
        .au-track-body { padding:1.25rem; border-top:1px solid #ccc5b9; background:#faf8f4; display:flex; flex-direction:column; gap:1rem; }
        /* Progress */
        .au-progress-bar { width:100%; height:4px; background:#f5f0e8; }
        .au-progress-fill { height:100%; background:#eb5e28; transition:width .3s; }
        /* Message */
        .au-msg { padding:.85rem 1.25rem; font-size:.78rem; font-weight:600; display:flex; align-items:center; gap:.5rem; }
        .au-msg.error { background:#fff0ee; color:#c0392b; border-left:3px solid #c0392b; }
        .au-msg.success { background:#f0faf4; color:#2d6a4f; border-left:3px solid #2d6a4f; }
        /* Done screen */
        .au-done { text-align:center; padding:4rem 2rem; }
        .au-done-icon { width:56px; height:56px; background:#eb5e28; display:flex; align-items:center; justify-content:center; margin:0 auto 1.25rem; }
        @media(max-width:640px){
          .au-root { padding:1.25rem; }
          .au-grid-2,.au-grid-3 { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="au-root">
        <div className="au-card">
          {/* Header */}
          <h1 className="au-h1">
            Upload <em>Album</em>
          </h1>
          <p className="au-sub">
            {step === "form" && "Fill in album details and select your tracks."}
            {step === "preview" &&
              `Review and edit ${editableTracks.length} parsed tracks before publishing.`}
            {step === "uploading" &&
              "Uploading to Bunny.net and saving to database…"}
            {step === "done" && "Album published successfully."}
          </p>

          {/* ── STEP 1: FORM ──────────────────────────────────────────────── */}
          {step === "form" && (
            <form onSubmit={handleReviewClick}>
              {/* Album metadata */}
              <div className="au-section">
                <div className="au-section-title">Album Details</div>
                <div
                  className="au-grid-2"
                  style={{ gap: "1rem", marginBottom: "1rem" }}
                >
                  <Field label="Album Title">
                    <input
                      style={inputStyle}
                      required
                      value={albumData.title}
                      onChange={(e) =>
                        setAlbumData({ ...albumData, title: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Composer / Artist">
                    <input
                      style={inputStyle}
                      required
                      value={albumData.composer}
                      onChange={(e) =>
                        setAlbumData({ ...albumData, composer: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      style={selectStyle}
                      required
                      value={albumData.category}
                      onChange={(e) =>
                        setAlbumData({ ...albumData, category: e.target.value })
                      }
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Genre">
                    <select
                      style={selectStyle}
                      required
                      value={albumData.genre}
                      onChange={(e) =>
                        setAlbumData({ ...albumData, genre: e.target.value })
                      }
                    >
                      <option value="">Select genre</option>
                      {GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Release Date">
                    <input
                      style={inputStyle}
                      type="date"
                      required
                      value={albumData.releaseDate}
                      onChange={(e) =>
                        setAlbumData({
                          ...albumData,
                          releaseDate: e.target.value,
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    style={{ ...inputStyle, resize: "vertical" }}
                    rows={3}
                    required
                    value={albumData.description}
                    onChange={(e) =>
                      setAlbumData({
                        ...albumData,
                        description: e.target.value,
                      })
                    }
                  />
                </Field>
                <div style={{ marginTop: "1rem" }}>
                  <Field label="Album Mood (optional — applies to all tracks as a starting point)">
                    <TagPills
                      options={MOODS}
                      selected={albumData.mood}
                      onChange={(v) => setAlbumData({ ...albumData, mood: v })}
                      max={5}
                    />
                  </Field>
                </div>
              </div>

              {/* Files */}
              <div className="au-section">
                <div className="au-section-title">Files</div>
                <div
                  className="au-grid-3"
                  style={{ gap: "1rem", marginBottom: "1rem" }}
                >
                  {/* Cover image */}
                  <label className="au-file-drop">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCoverImage(e.target.files?.[0] || null)
                      }
                    />
                    <div className="au-file-icon">
                      <Upload size={24} />
                    </div>
                    <div className="au-file-label">Cover Image</div>
                    <div className="au-file-sub">JPG, PNG, WEBP</div>
                    {coverImage && (
                      <div className="au-file-selected">
                        ✓ {coverImage.name}
                      </div>
                    )}
                  </label>

                  {/* Cue sheet */}
                  <label className="au-file-drop">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setCueSheet(e.target.files?.[0] || null)}
                    />
                    <div className="au-file-icon">
                      <Upload size={24} />
                    </div>
                    <div className="au-file-label">Cue Sheet</div>
                    <div className="au-file-sub">PDF — optional</div>
                    {cueSheet && (
                      <div className="au-file-selected">✓ {cueSheet.name}</div>
                    )}
                  </label>

                  {/* Tracks */}
                  <label className="au-file-drop">
                    <input
                      type="file"
                      accept="audio/*,.aif,.aiff"
                      multiple
                      onChange={handleTrackFilesChange}
                    />
                    <div className="au-file-icon">
                      <Music size={24} />
                    </div>
                    <div className="au-file-label">Track Files</div>
                    <div className="au-file-sub">MP3, WAV, AIF, FLAC</div>
                    {trackFiles.length > 0 && (
                      <div className="au-file-selected">
                        ✓ {trackFiles.length} track
                        {trackFiles.length !== 1 ? "s" : ""} selected
                      </div>
                    )}
                  </label>
                </div>

                {/* Parsed track preview — filenames only */}
                {editableTracks.length > 0 && (
                  <div style={{ marginTop: ".75rem" }}>
                    <div
                      style={{
                        fontSize: ".65rem",
                        fontWeight: 600,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "#403d39",
                        opacity: 0.45,
                        marginBottom: ".5rem",
                      }}
                    >
                      Detected {editableTracks.length} tracks
                    </div>
                    {editableTracks.map((t, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: ".4rem 0",
                          borderBottom: "1px solid #f0ece4",
                          fontSize: ".75rem",
                          color: "#403d39",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {String(t.trackNumber).padStart(2, "0")}. {t.title}
                        </span>
                        <span style={{ opacity: 0.45 }}>
                          {t.bpm ? `${t.bpm} BPM` : ""} ·{" "}
                          {t.parsed.format.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {message.text && (
                <div className={`au-msg ${message.type}`}>
                  <AlertCircle size={14} /> {message.text}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "1.25rem",
                }}
              >
                <button type="submit" className="au-btn au-btn-primary">
                  Review Tracks →
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: PREVIEW / EDIT TRACKS ────────────────────────────── */}
          {step === "preview" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <button
                  className="au-btn au-btn-ghost"
                  onClick={() => setStep("form")}
                >
                  ← Back
                </button>
                <div
                  style={{
                    fontSize: ".72rem",
                    color: "#403d39",
                    opacity: 0.55,
                  }}
                >
                  Album:{" "}
                  <strong style={{ color: "#252422", opacity: 1 }}>
                    {albumData.title}
                  </strong>{" "}
                  · {editableTracks.length} tracks
                </div>
              </div>

              {/* Track cards */}
              {editableTracks.map((track, idx) => (
                <div key={idx} className="au-track-card">
                  {/* Header — click to expand */}
                  <div
                    className="au-track-header"
                    onClick={() =>
                      updateTrack(idx, { expanded: !track.expanded })
                    }
                  >
                    <span className="au-track-num">
                      {String(track.trackNumber).padStart(2, "0")}
                    </span>
                    <span className="au-track-title-display">
                      {track.title || "Untitled"}
                    </span>
                    <div className="au-track-badges">
                      {track.bpm > 0 && (
                        <span className="au-badge">{track.bpm} BPM</span>
                      )}
                      {track.energy && (
                        <span className="au-badge orange">
                          {track.energy.replace("_", " ")}
                        </span>
                      )}
                      {track.mood.slice(0, 2).map((m) => (
                        <span key={m} className="au-badge">
                          {m}
                        </span>
                      ))}
                    </div>
                    {track.expanded ? (
                      <ChevronUp
                        size={14}
                        style={{ color: "#ccc5b9", flexShrink: 0 }}
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                        style={{ color: "#ccc5b9", flexShrink: 0 }}
                      />
                    )}
                  </div>

                  {/* Expanded body */}
                  {track.expanded && (
                    <div className="au-track-body">
                      <div className="au-grid-2">
                        <Field label="Title">
                          <input
                            style={inputStyle}
                            value={track.title}
                            onChange={(e) =>
                              updateTrack(idx, { title: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Track Number">
                          <input
                            style={inputStyle}
                            type="number"
                            min={1}
                            value={track.trackNumber}
                            onChange={(e) =>
                              updateTrack(idx, {
                                trackNumber:
                                  parseInt(e.target.value) || idx + 1,
                              })
                            }
                          />
                        </Field>
                        <Field label="Composer">
                          <input
                            style={inputStyle}
                            value={track.composer}
                            onChange={(e) =>
                              updateTrack(idx, { composer: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Genre">
                          <select
                            style={selectStyle}
                            value={track.genre}
                            onChange={(e) =>
                              updateTrack(idx, { genre: e.target.value })
                            }
                          >
                            <option value="">Select genre</option>
                            {GENRES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="BPM">
                          <input
                            style={inputStyle}
                            type="number"
                            min={0}
                            max={300}
                            value={track.bpm || ""}
                            onChange={(e) =>
                              updateTrack(idx, {
                                bpm: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </Field>
                        <Field label="Musical Key">
                          <input
                            style={inputStyle}
                            placeholder="e.g. C Major, A Minor"
                            value={track.musicalKey || ""}
                            onChange={(e) =>
                              updateTrack(idx, { musicalKey: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Energy">
                          <select
                            style={selectStyle}
                            value={track.energy}
                            onChange={(e) =>
                              updateTrack(idx, {
                                energy: e.target
                                  .value as (typeof ENERGIES)[number],
                              })
                            }
                          >
                            {ENERGIES.map((e) => (
                              <option key={e} value={e}>
                                {e.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Version">
                          <select
                            style={selectStyle}
                            value={track.version}
                            onChange={(e) =>
                              updateTrack(idx, {
                                version: e.target
                                  .value as (typeof VERSIONS)[number],
                              })
                            }
                          >
                            {VERSIONS.map((v) => (
                              <option key={v} value={v}>
                                {v.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Vocals">
                          <select
                            style={selectStyle}
                            value={track.vocals}
                            onChange={(e) =>
                              updateTrack(idx, {
                                vocals: e.target
                                  .value as (typeof VOCALS)[number],
                              })
                            }
                          >
                            {VOCALS.map((v) => (
                              <option key={v} value={v}>
                                {v.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="License Tier">
                          <select
                            style={selectStyle}
                            value={track.licenseTier}
                            onChange={(e) =>
                              updateTrack(idx, {
                                licenseTier: e.target
                                  .value as (typeof LIC_TIERS)[number],
                              })
                            }
                          >
                            {LIC_TIERS.map((l) => (
                              <option key={l} value={l}>
                                {l}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      <Field label="Mood Tags (pick 2–5)">
                        <TagPills
                          options={MOODS}
                          selected={track.mood}
                          onChange={(v) => updateTrack(idx, { mood: v })}
                          max={5}
                        />
                      </Field>

                      <Field label="Instruments">
                        <TagPills
                          options={INSTRUMENTS}
                          selected={track.instruments}
                          onChange={(v) => updateTrack(idx, { instruments: v })}
                        />
                      </Field>

                      <Field label="Usage Tags">
                        <TagPills
                          options={USAGE_TAGS}
                          selected={track.usageTags}
                          onChange={(v) => updateTrack(idx, { usageTags: v })}
                        />
                      </Field>

                      <div style={{ display: "flex", gap: "1.5rem" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            fontSize: ".75rem",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={track.downloadable}
                            onChange={(e) =>
                              updateTrack(idx, {
                                downloadable: e.target.checked,
                              })
                            }
                          />
                          Downloadable
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            fontSize: ".75rem",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={track.newRelease}
                            onChange={(e) =>
                              updateTrack(idx, { newRelease: e.target.checked })
                            }
                          />
                          New Release
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            fontSize: ".75rem",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={track.featured}
                            onChange={(e) =>
                              updateTrack(idx, { featured: e.target.checked })
                            }
                          />
                          Featured
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {message.text && (
                <div
                  className={`au-msg ${message.type}`}
                  style={{ marginTop: "1rem" }}
                >
                  <AlertCircle size={14} /> {message.text}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1.5rem",
                }}
              >
                <button
                  className="au-btn au-btn-ghost"
                  onClick={() => setStep("form")}
                >
                  ← Back to Album Details
                </button>
                <button
                  className="au-btn au-btn-primary"
                  onClick={handlePublish}
                >
                  Publish Album →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: UPLOADING ─────────────────────────────────────────── */}
          {step === "uploading" && (
            <div className="au-section">
              <div className="au-section-title">Uploading to Bunny.net</div>
              {uploadProgress.map((p, i) => (
                <div key={i} style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".72rem",
                      marginBottom: ".35rem",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#252422" }}>
                      {p.fileName}
                    </span>
                    <span
                      style={{
                        color:
                          p.status === "completed"
                            ? "#2d6a4f"
                            : p.status === "error"
                              ? "#c0392b"
                              : "#eb5e28",
                        fontWeight: 600,
                      }}
                    >
                      {p.status === "completed"
                        ? "Done"
                        : p.status === "error"
                          ? "Error"
                          : p.status === "uploading"
                            ? `${Math.round(p.progress)}%`
                            : "Waiting"}
                    </span>
                  </div>
                  <div className="au-progress-bar">
                    <div
                      className="au-progress-fill"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  {p.error && (
                    <p
                      style={{
                        fontSize: ".65rem",
                        color: "#c0392b",
                        marginTop: ".25rem",
                      }}
                    >
                      {p.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 4: DONE ─────────────────────────────────────────────── */}
          {step === "done" && (
            <div className="au-done">
              <div className="au-done-icon">
                <Check size={24} color="#fffcf2" />
              </div>
              <h2
                style={{
                  fontFamily: "Syne,sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: ".5rem",
                }}
              >
                Album Published
              </h2>
              <p
                style={{
                  fontSize: ".78rem",
                  color: "#403d39",
                  opacity: 0.55,
                  marginBottom: "1.5rem",
                }}
              >
                {editableTracks.length} tracks uploaded to Bunny.net and saved
                to the database.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: ".75rem",
                  justifyContent: "center",
                }}
              >
                <Link href={`/library`}>
                  <button className="au-btn au-btn-secondary">
                    View Library
                  </button>
                </Link>
                <button className="au-btn au-btn-primary" onClick={reset}>
                  Upload Another Album
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
