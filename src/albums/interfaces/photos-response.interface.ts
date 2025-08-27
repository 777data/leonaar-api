import { Photo } from './photo.interface';
import { PhotoThumbnail } from './photo-thumbnail.interface';

export interface PhotosResponse {
  photos: Photo[];
  total: number;
  limit?: number;
  offset: number;
}

export interface PhotosThumbnailsResponse {
  photos: PhotoThumbnail[];
  total: number;
  limit?: number;
  offset: number;
}
