-- Initialisation de la base de données leonaar

-- Activer l'extension uuid-ossp pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer la table users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Créer la table albums
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "coverImage" VARCHAR(500),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Créer la table photos
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "imageUrl" VARCHAR(500) NOT NULL,
    "thumbnailUrl" VARCHAR(500) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "thumbnailFileName" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    "albumId" UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_albums_title ON albums(title);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos("albumId");
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos("createdAt");
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums("userId");
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos("userId");