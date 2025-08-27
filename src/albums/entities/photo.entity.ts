import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Album } from './album.entity';

@Entity('photos')
@Index(['albumId']) // Index sur albumId pour les requêtes de jointure
@Index(['createdAt']) // Index sur la date pour le tri
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  imageUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  thumbnailUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  fileName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  thumbnailFileName: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedAt: Date;

  // Clé étrangère vers l'album
  @Column({ type: 'uuid', nullable: false })
  albumId: string;

  // Relation avec l'album
  @ManyToOne(() => Album, album => album.photos, { 
    onDelete: 'CASCADE' // Supprime la photo si l'album est supprimé
  })
  @JoinColumn({ name: 'albumId' })
  album: Album;
}
