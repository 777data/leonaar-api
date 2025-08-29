import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosService } from './photos.service';
import { Photo } from './entities/photo.entity';
import { Album } from '../albums/entities/album.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Photo, Album]),
  ],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
