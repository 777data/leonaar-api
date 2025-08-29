import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Album } from '../../albums/entities/album.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  albumId: string;

  @Column()
  imageUrl: string;

  @Column()
  thumbnailUrl: string;

  @Column()
  fileName: string;

  @Column()
  thumbnailFileName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Album, album => album.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'albumId' })
  album: Album;
}
