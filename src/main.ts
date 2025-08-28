import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded, static as staticFiles } from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration pour être accessible depuis le réseau local
  const port = process.env.PORT ?? 4000;
  const host = '0.0.0.0'; // Écoute sur toutes les interfaces réseau
  
  // Configuration des limites de taille pour les images
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  
  // Configuration des fichiers statiques (plus fiable que dans le module)
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log(`📁 Configuration fichiers statiques: ${uploadsPath}`);
  console.log(`📁 Dossier existe: ${require('fs').existsSync(uploadsPath)}`);
  
  app.use('/uploads', staticFiles(uploadsPath, {
    setHeaders: (res, filePath) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=31536000');
      console.log(`📁 Fichier statique servi: ${filePath}`);
    }
  }));
  
  // Configuration CORS pour permettre l'accès depuis d'autres domaines
  app.enableCors({
           origin: [
             'http://localhost:4000',
             'http://localhost:19006', // Expo dev server
             /^https:\/\/.*\.loca\.lt$/, // Tous les domaines localtunnel
             /^https:\/\/.*\.ngrok-free\.app$/, // Domaines ngrok
           ],
           methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
           credentials: true,
         });
  
  await app.listen(port, host);
  console.log(`🚀 Application démarrée sur http://localhost:${port}`);
  console.log(`📱 Prêt pour localtunnel ou ngrok !`);
  console.log(`🖼️ Limite de taille des images : 50MB`);
  console.log(`📁 Images stockées dans: ${join(process.cwd(), 'uploads')}`);
}
bootstrap();
