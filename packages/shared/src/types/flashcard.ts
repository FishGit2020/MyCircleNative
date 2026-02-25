export type CardType = 'chinese' | 'english' | 'bible-first-letter' | 'bible-full' | 'custom';

export interface FlashCard {
  id: string;
  type: CardType;
  front: string;
  back: string;
  category?: string;
  meta?: {
    pinyin?: string;
    phonetic?: string;
    reference?: string;
  };
}

export interface FlashCardProgress {
  masteredIds: string[];
  lastPracticed?: string; // ISO date string
}

export interface ChineseCharacter {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  category: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: Date | { seconds: number; nanoseconds: number };
  updatedAt?: Date | { seconds: number; nanoseconds: number };
}
