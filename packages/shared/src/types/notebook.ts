export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt: Date | { seconds: number; nanoseconds: number };
}

export interface PublicNote extends Note {
  authorUid: string;
  authorName: string;
  publishedAt: Date | { seconds: number; nanoseconds: number };
}
