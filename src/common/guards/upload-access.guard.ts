import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UploadAccessGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const uploadPath = request.path;
    
    if (!uploadPath.startsWith('/uploads/')) {
      return true;
    }
    
    const pathParts = uploadPath.split('/');
    if (pathParts.length < 4) {
      throw new UnauthorizedException('Chemin d\'accès invalide');
    }
    
    const requestedUserId = pathParts[2];
    
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token d\'authentification requis');
    }
    
    try {
      const token = authHeader.substring(7);
      const payload = this.jwtService.verify(token);
      
      if (payload.sub !== requestedUserId) {
        throw new UnauthorizedException('Accès non autorisé');
      }
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}