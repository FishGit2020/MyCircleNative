export type FileType = 'document' | 'image' | 'video' | 'audio' | 'spreadsheet' | 'presentation' | 'pdf' | 'archive' | 'other';

export interface CloudFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  ownerId: string;
  ownerName: string;
  shared: boolean;
  sharedWith: string[];
  createdAt: number;
  updatedAt: number;
  folderId?: string;
}

export interface CloudFolder {
  id: string;
  name: string;
  parentId?: string;
  ownerId: string;
  createdAt: number;
}
