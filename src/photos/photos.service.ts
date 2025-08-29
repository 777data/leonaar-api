import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
import { Album } from '../albums/entities/album.entity';
import { PhotosResponse } from './interfaces/photos-response.interface';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class PhotosService {
  // Configuration du stockage local
  private readonly STORAGE_FOLDER = 'albums';
  private readonly STORAGE_PATH = path.join(process.cwd(), this.STORAGE_FOLDER);
  
  // Configuration de la compression
  private readonly COMPRESSION_QUALITY = 80; // Qualité WebP (0-100)
  private readonly COMPRESSION_EFFORT = 6; // Niveau de compression (0-6)
  private readonly MAX_IMAGE_WIDTH = 1920; // Largeur maximale en pixels
  private readonly MAX_IMAGE_HEIGHT = 1080; // Hauteur maximale en pixels
  
  // Configuration des miniatures
  private readonly THUMBNAIL_WIDTH = 300; // Largeur de la miniature en pixels
  private readonly THUMBNAIL_HEIGHT = 300; // Hauteur de la miniature en pixels
  private readonly THUMBNAIL_QUALITY = 70; // Qualité WebP pour les miniatures (0-100)
  
  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
  ) {
    // Créer le dossier de stockage s'il n'existe pas
    this.ensureStorageDirectory();
  }
  
  private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.STORAGE_PATH)) {
      fs.mkdirSync(this.STORAGE_PATH, { recursive: true });
      console.log(`📁 Dossier de stockage créé: ${this.STORAGE_PATH}`);
    }
  }

  // Méthode pour obtenir le chemin sécurisé par utilisateur
  private getUserStoragePath(userId: string): string {
    return path.join(process.cwd(), this.STORAGE_FOLDER, userId);
  }

  // Méthode pour obtenir le chemin d'un album spécifique
  private getAlbumStoragePath(userId: string, albumId: string): string {
    return path.join(this.getUserStoragePath(userId), albumId);
  }

  // Méthode pour obtenir le chemin des miniatures
  private getThumbnailsStoragePath(userId: string, albumId: string): string {
    return path.join(this.getAlbumStoragePath(userId, albumId), 'thumbnails');
  }

  // Méthode pour construire l'URL de l'image
  private buildImageUrl(albumId: string, photoId: string): string {
    return `/albums/${albumId}/${photoId}.webp`;
  }

  // Méthode pour construire l'URL de la miniature
  private buildThumbnailUrl(albumId: string, photoId: string): string {
    return `/albums/${albumId}/thumbnails/${photoId}.webp`;
  }

  // Méthode pour obtenir le chemin du fichier sur le disque
  private getImageFilePath(userId: string, albumId: string, photoId: string): string {
    return path.join(this.getAlbumStoragePath(userId, albumId), `${photoId}.webp`);
  }

  // Méthode pour obtenir le chemin de la miniature sur le disque
  private getThumbnailFilePath(userId: string, albumId: string, photoId: string): string {
    return path.join(this.getThumbnailsStoragePath(userId, albumId), `${photoId}.webp`);
  }

  // Vérifier que l'album existe et appartient à l'utilisateur
  private async verifyAlbumOwnership(userId: string, albumId: string): Promise<Album> {
    const album = await this.albumRepository.findOne({ where: { userId, id: albumId } });
    if (!album) {
      throw new NotFoundException(`Album with ID ${albumId} not found`);
    }
    return album;
  }
  
  /**
   * Compresse une image en WebP avec une qualité optimisée
   * @param imageBuffer Buffer contenant l'image originale
   * @returns Buffer compressé en WebP
   */
  private async compressImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const originalSize = imageBuffer.length;
      
      // Obtenir les métadonnées de l'image
      const metadata = await sharp(imageBuffer).metadata();
      const originalWidth = metadata.width || 0;
      const originalHeight = metadata.height || 0;
      
      console.log(`📐 Dimensions originales: ${originalWidth}x${originalHeight}px`);
      
      // Redimensionner si l'image est trop grande
      let processedImage = sharp(imageBuffer);
      
      if (originalWidth > this.MAX_IMAGE_WIDTH || originalHeight > this.MAX_IMAGE_HEIGHT) {
        processedImage = processedImage.resize(this.MAX_IMAGE_WIDTH, this.MAX_IMAGE_HEIGHT, {
          fit: 'inside', // Garde les proportions
          withoutEnlargement: true // Ne pas agrandir les petites images
        });
        console.log(`📏 Redimensionnement: ${this.MAX_IMAGE_WIDTH}x${this.MAX_IMAGE_HEIGHT}px max`);
      }
      
      // Compression WebP avec paramètres optimisés
      const compressedBuffer = await processedImage
        .webp({ 
          quality: this.COMPRESSION_QUALITY,
          effort: this.COMPRESSION_EFFORT,
          nearLossless: false
        })
        .toBuffer();
      
      const compressedSize = compressedBuffer.length;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      
      console.log(`🗜️ Compression: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% d'économie)`);
      
      return compressedBuffer;
    } catch (error) {
      console.warn(`⚠️ Échec de la compression, utilisation de l'image originale: ${error.message}`);
      return imageBuffer;
    }
  }
  
  /**
   * Génère une miniature WebP optimisée
   * @param imageBuffer Buffer contenant l'image originale
   * @returns Buffer de la miniature WebP
   */
  private async generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const originalSize = imageBuffer.length;
      
      // Créer une miniature carrée avec redimensionnement intelligent
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT, {
          fit: 'cover', // Couvre complètement la zone (peut couper)
          position: 'center' // Centre le contenu
        })
        .webp({ 
          quality: this.THUMBNAIL_QUALITY,
          effort: 4, // Effort modéré pour les miniatures
          nearLossless: false
        })
        .toBuffer();
      
      const thumbnailSize = thumbnailBuffer.length;
      const thumbnailRatio = ((originalSize - thumbnailSize) / originalSize * 100).toFixed(1);
      
      console.log(`🖼️ Miniature: ${(originalSize / 1024).toFixed(1)}KB → ${(thumbnailSize / 1024).toFixed(1)}KB (${thumbnailRatio}% d'économie)`);
      
      return thumbnailBuffer;
    } catch (error) {
      console.warn(`⚠️ Échec de la génération de miniature, utilisation de l'image originale: ${error.message}`);
      return imageBuffer;
    }
  }

  // Ajouter une photo à un album
  async addPhoto(userId: string, albumId: string, imageFile: Buffer): Promise<Photo> {
    // Vérifier que l'album existe et appartient à l'utilisateur
    await this.verifyAlbumOwnership(userId, albumId);
    
    // Validation que nous avons bien un fichier image
    if (!imageFile || (imageFile instanceof Buffer && imageFile.length === 0)) {
      throw new Error('Fichier image requis et non vide');
    }
    
    try {
      // Log pour débogage
      console.log(`📸 Traitement image - Taille: ${imageFile.length} bytes`);
      
      // Validation de la taille
      if (imageFile.length < 100) {
        throw new Error('Fichier image trop petit, données corrompues');
      }
      
      // Créer d'abord l'entité Photo pour obtenir l'ID
      const photo = this.photoRepository.create({
        userId: userId,
        albumId: albumId,
      });
      
      // Sauvegarder pour obtenir l'ID généré
      const savedPhoto = await this.photoRepository.save(photo);
      
      // Compresser l'image en WebP
      const compressedImage = await this.compressImage(imageFile);
      
      // Générer la miniature
      const thumbnailImage = await this.generateThumbnail(imageFile);
      
      // Utiliser l'ID de la photo comme nom de fichier
      const filePath = this.getImageFilePath(userId, albumId, savedPhoto.id);
      const thumbnailPath = this.getThumbnailFilePath(userId, albumId, savedPhoto.id);
      
      // Créer les dossiers s'ils n'existent pas
      const albumFolder = this.getAlbumStoragePath(userId, albumId);
      const thumbnailsFolder = this.getThumbnailsStoragePath(userId, albumId);
      
      if (!fs.existsSync(albumFolder)) {
        fs.mkdirSync(albumFolder, { recursive: true });
      }
      if (!fs.existsSync(thumbnailsFolder)) {
        fs.mkdirSync(thumbnailsFolder, { recursive: true });
      }
      
      // Sauvegarder l'image compressée et la miniature
      try {
        fs.writeFileSync(filePath, compressedImage);
        fs.writeFileSync(thumbnailPath, thumbnailImage);
        console.log(`💾 Image compressée sauvegardée: ${filePath}`);
        console.log(`🖼️ Miniature sauvegardée: ${thumbnailPath}`);
      } catch (error) {
        // En cas d'erreur de sauvegarde, supprimer l'entité créée
        await this.photoRepository.remove(savedPhoto);
        throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
      }
      
      return savedPhoto;
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout de la photo: ${error.message}`);
    }
  }

  // Récupérer toutes les photos d'un album (avec toutes les informations)
  async getAlbumPhotos(userId: string, albumId: string, limit?: number, offset: number = 0, order: 'asc' | 'desc' = 'desc'): Promise<PhotosResponse> {
    // Vérifier que l'album existe et appartient à l'utilisateur
    await this.verifyAlbumOwnership(userId, albumId);
    
    // Construire la requête avec TypeORM
    const queryBuilder = this.photoRepository
      .createQueryBuilder('photo')
      .where('photo.albumId = :albumId', { albumId })
      .orderBy('photo.createdAt', order.toUpperCase() as 'ASC' | 'DESC');
    
    // Compter le total
    const total = await queryBuilder.getCount();
    
    // Appliquer l'offset et la limite
    if (limit && limit > 0) {
      queryBuilder.offset(offset).limit(limit);
    } else if (offset > 0) {
      queryBuilder.offset(offset);
    }
    
    const photos = await queryBuilder.getMany();
    
    return {
      photos,
      total,
      limit,
      offset
    };
  }

  // Récupérer une photo spécifique
  async getPhoto(userId: string, albumId: string, photoId: string): Promise<Photo> {
    // Vérifier que l'album existe et appartient à l'utilisateur
    await this.verifyAlbumOwnership(userId, albumId);
    
    const photo = await this.photoRepository.findOne({ 
      where: { id: photoId, albumId } 
    });
    
    if (!photo) {
      throw new NotFoundException(`Photo with ID ${photoId} not found in album ${albumId}`);
    }
    
    return photo;
  }

  // Mettre à jour une photo
  async updatePhoto(userId: string, albumId: string, photoId: string, imageFile: Buffer): Promise<Photo> {
    const photo = await this.getPhoto(userId, albumId, photoId);
    
    // Validation que nous avons bien un fichier image
    if (!imageFile || (imageFile instanceof Buffer && imageFile.length === 0)) {
      throw new Error('Fichier image requis et non vide');
    }
    
    try {
      // Supprimer l'ancienne image et sa miniature
      await this.removePhoto(userId, albumId, photoId);
      
      // Ajouter la nouvelle image (avec nouvelle miniature)
      const newPhoto = await this.addPhoto(userId, albumId, imageFile);
      
      // Mettre à jour l'ID pour garder la cohérence
      newPhoto.id = photoId;
      
      return newPhoto;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de la photo: ${error.message}`);
    }
  }

  // Supprimer une photo
  async removePhoto(userId: string, albumId: string, photoId: string): Promise<void> {
    // Vérifier que l'album existe et appartient à l'utilisateur
    await this.verifyAlbumOwnership(userId, albumId);
    
    const photo = await this.photoRepository.findOne({ 
      where: { id: photoId, albumId } 
    });
    
    if (!photo) {
      throw new NotFoundException(`Photo with ID ${photoId} not found in album ${albumId}`);
    }
    
    try {
      // Supprimer le fichier principal
      const filePath = this.getImageFilePath(userId, albumId, photo.id);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Fichier principal supprimé: ${filePath}`);
      }
      
      // Supprimer la miniature (même nom de fichier mais dans le dossier thumbnails)
      const thumbnailPath = this.getThumbnailFilePath(userId, albumId, photo.id);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
        console.log(`🗑️ Miniature supprimée: ${thumbnailPath}`);
      }
      
      // Supprimer de la base de données
      await this.photoRepository.remove(photo);
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de la photo: ${error.message}`);
    }
  }
}
