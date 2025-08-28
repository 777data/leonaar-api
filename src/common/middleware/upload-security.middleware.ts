// src/common/middleware/upload-security.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UploadSecurityMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const uploadPath = req.path;
    
    // Vérifier que le chemin commence par /uploads/
    if (!uploadPath.startsWith('/uploads/')) {
      return next();
    }
    
    // Extraire userId et albumId du chemin
    // Format attendu: /uploads/userId/albumId/filename
    const pathParts = uploadPath.split('/');
    if (pathParts.length < 4) {
      throw new UnauthorizedException('Chemin d\'accès invalide');
    }
    
    const requestedUserId = pathParts[2];
    const albumId = pathParts[3];
    
    // Vérifier le token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token d\'authentification requis');
    }
    
    try {
      const token = authHeader.substring(7);
      const payload = this.jwtService.verify(token);
      
      // Vérifier que l'utilisateur accède à ses propres fichiers
      if (payload.sub !== requestedUserId) {
        throw new UnauthorizedException('Accès non autorisé à ce fichier');
      }
      
      next();
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}