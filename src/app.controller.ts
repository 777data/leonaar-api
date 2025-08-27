import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-upload/:albumId/:filename')
  async testUpload(
    @Param('albumId') albumId: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = path.join(process.cwd(), 'uploads', albumId, filename);
    console.log(`🔍 Test accès fichier: ${filePath}`);
    console.log(`🔍 Fichier existe: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res.status(404).json({ 
        error: 'Fichier non trouvé',
        path: filePath,
        exists: false
      });
    }
  }
}
