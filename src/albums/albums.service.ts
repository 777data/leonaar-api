import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './entities/album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
  ) {}

  async create(userId: string, createAlbumDto: CreateAlbumDto): Promise<Album> {
    const album = this.albumRepository.create({
      ...createAlbumDto,
      userId
    });
    
    return await this.albumRepository.save(album);
  }

  async findAll(userId: string): Promise<Album[]> {
    return this.albumRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Album> {
    const album = await this.albumRepository.findOne({ where: { userId, id } });
    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }
    return album;
  }

  async update(userId: string, id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const album = await this.findOne(userId, id);
    
    Object.assign(album, updateAlbumDto);
    album.updatedAt = new Date();
    
    return await this.albumRepository.save(album);
  }

  async remove(userId: string, id: string): Promise<void> {
    const album = await this.findOne(userId, id);
    await this.albumRepository.remove(album);
  }
}
