import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
  ForbiddenException,
  NotFoundException,
  Put,
} from '@nestjs/common';
import type { Response } from 'express';
import { AlbumsService } from './albums.service';
import { PhotosService } from '../photos/photos.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Album } from './interfaces/album.interface';
import type { Photo } from '../photos/entities/photo.entity';
import type { PhotosResponse } from '../photos/interfaces/photos-response.interface';
import * as fs from 'fs'; 
import * as path from 'path'; 

@Controller('albums')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly photosService: PhotosService,
  ) {}

  @Post()
  async create(@Request() req, @Body() createAlbumDto: CreateAlbumDto): Promise<Album> {
    return await this.albumsService.create(req.user.id, createAlbumDto);
  }

  @Get()
  async findAll(@Request() req): Promise<Album[]> {
    return await this.albumsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<Album> {
    return await this.albumsService.findOne(req.user.id, id);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    return await this.albumsService.update(req.user.id, id, updateAlbumDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return await this.albumsService.remove(req.user.id, id);
  }

  // === ENDPOINTS POUR LES PHOTOS ===

  // Récupérer toutes les photos d'un album (avec toutes les informations)
  @Get(':albumId/photos')
  async getAlbumPhotos(
    @Request() req,
    @Param('albumId') albumId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('order') order?: 'asc' | 'desc',
  ): Promise<PhotosResponse> {
    const maxPhotos = limit ? parseInt(limit, 10) : undefined;
    const offsetValue = offset ? parseInt(offset, 10) : 0;
    const sortOrder = order === 'asc' ? 'asc' : 'desc'; // Par défaut: desc (plus récentes en premier)
    return await this.photosService.getAlbumPhotos(req.user.id, albumId, maxPhotos, offsetValue, sortOrder);
  }

  // Récupérer une photo spécifique (retourne l'image elle-même)
  @Get(':albumId/photos/:photoId')
  async getPhoto(
    @Request() req,
    @Param('albumId') albumId: string,
    @Param('photoId') photoId: string,
    @Res() res: Response,
    @Query('size') size?: 'thumbnail' | 'original'
  ): Promise<void> {
    // Vérifier que l'album appartient à l'utilisateur
    await this.albumsService.findOne(req.user.id, albumId);
    
    // Vérifier que la photo existe et appartient à l'album
    const photo = await this.photosService.getPhoto(req.user.id, albumId, photoId);
    
    // Déterminer le chemin du fichier selon la taille demandée
    let filePath: string;
    if (size === 'thumbnail') {
      filePath = path.join(process.cwd(), 'albums', req.user.id, albumId, 'thumbnails', `${photoId}.webp`);
    } else {
      filePath = path.join(process.cwd(), 'albums', req.user.id, albumId, `${photoId}.webp`);
    }
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier non trouvé');
    }
    
    // Servir l'image avec le bon type MIME
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
    res.sendFile(filePath);
  }

  // Ajouter une photo à un album
  @Post(':id/photos')
  async addPhoto(
    @Request() req,
    @Param('id') albumId: string,
    @Body('image') image: string, // Base64 ou données binaires
  ): Promise<Photo> {
    if (!image) {
      throw new Error('image est requis');
    }
    
    try {
      // Nettoyer la chaîne base64 (supprimer les espaces, retours à la ligne, etc.)
      let cleanImage = image.replace(/\s/g, '');
      
      // Gérer le préfixe data:image/...;base64,
      if (cleanImage.includes('data:image/') && cleanImage.includes(';base64,')) {
        const base64Start = cleanImage.indexOf(';base64,') + 8;
        cleanImage = cleanImage.substring(base64Start);
        console.log('🔍 Préfixe MIME détecté et supprimé');
      }
      
      // Validation de base64
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanImage)) {
        console.error('❌ Format base64 invalide:', cleanImage.substring(0, 50) + '...');
        throw new Error('Format base64 invalide');
      }
      
      console.log('✅ Format base64 valide, longueur:', cleanImage.length);
      
      // Convertir le base64 en Buffer
      const buffer = Buffer.from(cleanImage, 'base64');
      
      // Validation de la taille
      if (buffer.length < 100) {
        throw new Error('Image trop petite, données corrompues');
      }
      
      if (buffer.length > 50 * 1024 * 1024) { // 50MB max
        throw new Error('Image trop volumineuse (max 50MB)');
      }
      
      console.log('📸 Buffer créé avec succès, taille:', buffer.length, 'bytes');
      
      return this.photosService.addPhoto(req.user.id, albumId, buffer);
    } catch (error) {
      if (error.message.includes('base64')) {
        throw new Error('Format d\'image invalide. Assurez-vous que l\'image est bien encodée en base64.');
      }
      throw error;
    }
  }

  // Mettre à jour une photo
  @Patch(':albumId/photos/:photoId')
  async updatePhoto(
    @Request() req,
    @Param('albumId') albumId: string,
    @Param('photoId') photoId: string,
    @Body('image') image: string,
  ): Promise<Photo> {
    if (!image) {
      throw new Error('image est requis');
    }
    
    try {
      // Nettoyer la chaîne base64 (supprimer les espaces, retours à la ligne, etc.)
      let cleanImage = image.replace(/\s/g, '');
      
      // Gérer le préfixe data:image/...;base64,
      if (cleanImage.includes('data:image/') && cleanImage.includes(';base64,')) {
        const base64Start = cleanImage.indexOf(';base64,') + 8;
        cleanImage = cleanImage.substring(base64Start);
        console.log('🔍 Préfixe MIME détecté et supprimé');
      }
      
      // Validation de base64
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanImage)) {
        console.error('❌ Format base64 invalide:', cleanImage.substring(0, 50) + '...');
        throw new Error('Format base64 invalide');
      }
      
      console.log('✅ Format base64 valide, longueur:', cleanImage.length);
      
      // Convertir le base64 en Buffer
      const buffer = Buffer.from(cleanImage, 'base64');
      
      // Validation de la taille
      if (buffer.length < 100) {
        throw new Error('Image trop petite, données corrompues');
      }
      
      if (buffer.length > 50 * 1024 * 1024) { // 50MB max
        throw new Error('Image trop volumineuse (max 50MB)');
      }
      
      console.log('📸 Buffer créé avec succès, taille:', buffer.length, 'bytes');
      
      return this.photosService.updatePhoto(req.user.id, albumId, photoId, buffer);
    } catch (error) {
      if (error.message.includes('base64')) {
        throw new Error('Format d\'image invalide. Assurez-vous que l\'image est bien encodée en base64.');
      }
      throw error;
    }
  }

  // Supprimer une photo
  @Delete(':albumId/photos/:photoId')
  async removePhoto(
    @Request() req,
    @Param('albumId') albumId: string,
    @Param('photoId') photoId: string,
  ): Promise<void> {
    return this.photosService.removePhoto(req.user.id, albumId, photoId);
  }

  // Servir les images (endpoint pour récupérer les fichiers)
  @Get('albums/:userId/:albumId/:filename')
  @UseGuards(JwtAuthGuard)
  async serveImage(
    @Param('userId') userId: string,
    @Param('albumId') albumId: string,
    @Param('filename') filename: string,
    @Request() req,
    @Res() res: Response
  ) {
    // Vérifier que l'utilisateur accède à ses propres fichiers
    if (req.user.id !== userId) {
      throw new ForbiddenException('Accès non autorisé');
    }
    
    // Vérifier que l'album appartient à l'utilisateur
    await this.albumsService.findOne(userId, albumId);
    
    // Construire le chemin du fichier
    const filePath = path.join(process.cwd(), 'albums', userId, albumId, filename);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier non trouvé');
    }
    
    // Servir le fichier
    res.sendFile(filePath);
  }

  // Servir les miniatures
  @Get('albums/:userId/:albumId/thumbnails/:filename')
  @UseGuards(JwtAuthGuard)
  async serveThumbnail(
    @Param('userId') userId: string,
    @Param('albumId') albumId: string,
    @Param('filename') filename: string,
    @Request() req,
    @Res() res: Response
  ) {
    // Vérifier que l'utilisateur accède à ses propres fichiers
    if (req.user.id !== userId) {
      throw new ForbiddenException('Accès non autorisé');
    }
    
    // Vérifier que l'album appartient à l'utilisateur
    await this.albumsService.findOne(userId, albumId);
    
    // Construire le chemin du fichier miniature
    const filePath = path.join(process.cwd(), 'albums', userId, albumId, 'thumbnails', filename);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Fichier non trouvé');
    }
    
    // Servir le fichier
    res.sendFile(filePath);
  }
}
