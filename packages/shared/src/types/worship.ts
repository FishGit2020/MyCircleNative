export interface WorshipSong {
  id: string;
  title: string;
  artist?: string;
  key?: string;
  bpm?: number;
  format: 'chordpro' | 'text';
  content: string;
  youtubeUrl?: string;
  tags?: string[];
  notes?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt: Date | { seconds: number; nanoseconds: number };
}
