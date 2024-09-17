// src/types/global.d.ts

// Define the shape of the MemePicture object
type MemePictureType = {
  id: string;
  authorId: string;
  pictureUrl: string;
  texts: { content: string; x: number; y: number }[];
  description: string;
  createdAt: string;
  dataTestId?: string;
};

// Define the shape of the Author object
type MemeAuthor = {
  id: string;
  username: string;
  pictureUrl: string;
};
type MemeComment = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  memeId: string;
};
