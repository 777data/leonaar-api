import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Album } from '../albums/entities/album.entity';
import { Photo } from '../albums/entities/photo.entity';
import { User } from '../users/entities/user.entity';
import { envConfig } from './env.config';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: envConfig.database.host,
  port: envConfig.database.port,
  username: envConfig.database.username,
  password: envConfig.database.password,
  database: envConfig.database.name,
  entities: [Album, Photo, User],
  synchronize: envConfig.app.nodeEnv !== 'production', // Auto-sync en développement
  logging: envConfig.app.nodeEnv !== 'production',
  ssl: envConfig.app.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
};
