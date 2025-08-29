import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { json, urlencoded } from 'express';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AlbumsModule } from './albums/albums.module';
import { Photo } from './photos/entities/photo.entity';
import { Album } from './albums/entities/album.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig,
      entities: [User, Album, Photo],
    }),
    UsersModule,
    AuthModule,
    AlbumsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(json({ limit: '50mb' }), urlencoded({ limit: '50mb', extended: true }))
      .forRoutes('*');
  }
}
