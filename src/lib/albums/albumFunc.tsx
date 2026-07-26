import db from "@/db/db";

const fmtDuration = (seconds: number): string => {
  if (!seconds || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

export async function getAlbumData(albumId: string) {
  const album = await db.album.findUnique({
    where: { id: albumId },
    include: {
      tracks: {
        include: {
          trackDownloads: true,
        },
        orderBy: {
          trackNumber: "asc",
        },
      },
    },
  });

  if (!album) {
    return {
      album: null,
      tracks: [],
    };
  }

  const formattedAlbum = {
    id: album.id,
    title: album.title,
    description: album.description,
    category: album.category,
    genre: album.genre,
    composer: album.composer,
    coverImage: album.coverImage,
    cueSheet: album.cueSheet,
    mood: album.mood,
    featured: album.featured,
    trackCount: album.trackCount,
    releaseDate: album.releaseDate,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
  };

  const formattedTracks = album.tracks.map((track) => ({
    id: track.id,
    title: track.title,
    composer: track.composer,
    trackNumber: track.trackNumber,

    duration: fmtDuration(track.duration),

    version: track.version,
    isrc: track.isrc,
    releaseDate: track.releaseDate,
    parentTrackId: track.parentTrackId,

    genre: track.genre,
    subGenre: track.subGenre,
    mood: track.mood,
    energy: track.energy,
    bpm: track.bpm,
    musicalKey: track.musicalKey,

    instruments: track.instruments,
    vocals: track.vocals,
    vocalLanguage: track.vocalLanguage,
    featuredInstrument: track.featuredInstrument,

    category: track.category,
    usageTags: track.usageTags,

    downloadable: track.downloadable,
    licenseTier: track.licenseTier,
    exclusive: track.exclusive,

    cueSheetUrl: track.cueSheetUrl,
    audioUrl: track.audioUrl,
    waveformUrl: track.waveformUrl,

    playCount: track.playCount,
    downloadCount: track.downloadCount,

    featured: track.featured,
    newRelease: track.newRelease,
    tags: track.tags,

    createdAt: track.createdAt.toISOString().split("T")[0],
    updatedAt: track.updatedAt.toISOString().split("T")[0],

    albumId: track.albumId,

    downloads: track.trackDownloads,
  }));

  return {
    album: formattedAlbum,
    tracks: formattedTracks,
  };
}
