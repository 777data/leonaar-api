export interface Photo {
  id: string;
  imageUrl: string; // URL de l'image compressée en WebP (taille réelle)
  thumbnailUrl: string; // URL de la miniature WebP
  fileName: string; // Nom du fichier WebP
  thumbnailFileName: string; // Nom du fichier miniature
  createdAt: Date;
  albumId: string;
}
