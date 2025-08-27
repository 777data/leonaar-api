export interface PhotoThumbnail {
  id: string;
  thumbnailUrl: string; // URL de la miniature WebP
  thumbnailFileName: string; // Nom du fichier miniature
  createdAt: Date;
  albumId: string;
}
