-- Initialisation de la base de données leonaar
-- Ce fichier est exécuté automatiquement lors du premier démarrage du conteneur

-- Créer l'utilisateur leonaar_user (optionnel)
-- CREATE USER leonaar_user WITH ENCRYPTED PASSWORD 'leonaar_password';

-- Accorder les privilèges (optionnel)
-- GRANT ALL PRIVILEGES ON DATABASE leonaar TO leonaar_user;

-- Activer l'extension uuid-ossp pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer la table albums
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "coverImage" VARCHAR(500),
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
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_albums_title ON albums(title);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos("albumId");
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos("createdAt");

