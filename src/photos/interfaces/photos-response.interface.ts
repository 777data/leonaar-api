import { Photo } from '../entities/photo.entity';

export interface PhotosResponse {
  photos: Photo[];
  total: number;
  limit?: number;
  offset: number;
}
