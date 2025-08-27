import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { Photo } from './photo.entity';

@Entity('albums')
@Index(['title']) // Index sur le titre pour les recherches
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedAt: Date;

  // Relation avec les photos
  @OneToMany(() => Photo, photo => photo.album, { 
    cascade: true,
    onDelete: 'CASCADE' // Supprime les photos si l'album est supprimé
  })
  photos: Photo[];
}
