export class CreateAlbumDto {
  title: string;
  description: string;
  image: string; // Garde la compatibilité, sera mappé vers coverImage
}
