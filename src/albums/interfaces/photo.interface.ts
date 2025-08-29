export interface Photo {
  id: string;
  imageUrl: string; // URL de l'image compressée en WebP (taille réelle)
  thumbnailUrl: string; // URL de la miniature WebP
  createdAt: Date;
  albumId: string;
}
