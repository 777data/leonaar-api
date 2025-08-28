export const envConfig = {
  // Configuration de la base de données PostgreSQL
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'leonaar',
  },
  
  // Configuration de l'application
  app: {
    port: parseInt(process.env.PORT || '4000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // Configuration des images
  images: {
    maxSize: process.env.MAX_IMAGE_SIZE || '50MB',
    uploadFolder: process.env.UPLOAD_FOLDER || 'uploads',
  },
};
