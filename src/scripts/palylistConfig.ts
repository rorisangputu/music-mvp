// Script to generate playlist configurations
// Save this as: scripts/playlistConfigs.ts

export type PlaylistConfig = {
    id: string;
    title: string;
    description: string;
    targetGenres: string[];
    targetCategories: string[];
    coverColor?: string;
};

export const PLAYLIST_CONFIGS: PlaylistConfig[] = [
    {
        id: 'afro-tech-house',
        title: 'Afro Tech House',
        description: 'High-energy Afro Tech and House beats with African rhythms',
        targetGenres: ['Afro Tech', 'Afrobeats', 'African', 'Amapiano'],
        targetCategories: ['Electronic', 'Techno', 'Dance', 'House', 'African Music'],
        coverColor: '#FF6B35'
    },
    {
        id: 'cinematic-orchestral',
        title: 'Cinematic & Orchestral',
        description: 'Epic orchestral and dramatic cinematic compositions',
        targetGenres: ['Orchestral', 'Piano', 'Dramatic'],
        targetCategories: ['Cinematic', 'Classical'],
        coverColor: '#004E89'
    },
    {
        id: 'corporate-upbeat',
        title: 'Corporate & Upbeat',
        description: 'Professional, motivational tracks for business and presentations',
        targetGenres: ['Upbeat', 'Piano', 'Guitar', 'Instrumental'],
        targetCategories: ['Corporate', 'Pop'],
        coverColor: '#00A896'
    },
    {
        id: 'electronic-dance',
        title: 'Electronic Dance',
        description: 'Energetic electronic, techno, and house music',
        targetGenres: ['Techno', 'Synthesizer', 'Upbeat', 'Drums'],
        targetCategories: ['Electronic', 'Techno', 'Dance', 'House'],
        coverColor: '#9D4EDD'
    },
    {
        id: 'hip-hop-beats',
        title: 'Hip Hop Beats',
        description: 'Modern hip hop instrumentals and beats',
        targetGenres: ['Drums', 'Vocals', 'Instrumental'],
        targetCategories: ['Hip Hop'],
        coverColor: '#E63946'
    },
    {
        id: 'african-rhythms',
        title: 'African Rhythms',
        description: 'Traditional and contemporary African music including Mbaqanga and Amapiano',
        targetGenres: ['Mbaqanga', 'African', 'Amapiano', 'Afrobeats', 'Drums'],
        targetCategories: ['African Music', 'World Music'],
        coverColor: '#F77F00'
    },
    {
        id: 'ambient-chill',
        title: 'Ambient & Chill',
        description: 'Mellow, atmospheric tracks for relaxation and focus',
        targetGenres: ['Mellow', 'Piano', 'Synthesizer', 'Instrumental'],
        targetCategories: ['Ambient', 'Jazz'],
        coverColor: '#06FFA5'
    },
    {
        id: 'rock-guitar',
        title: 'Rock & Guitar',
        description: 'Powerful rock tracks featuring guitar-driven compositions',
        targetGenres: ['Guitar', 'Drums', 'Upbeat'],
        targetCategories: ['Rock'],
        coverColor: '#D62828'
    }
];
