export interface WorkEntry {
  id: string;
  date: string;
  content: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
}
