import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { Album } from './entities/album.entity';
import { UsersModule } from '../users/users.module';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Album]),
    UsersModule,
    PhotosModule,
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
