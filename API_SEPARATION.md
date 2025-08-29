# Structure des APIs Albums et Photos

## Vue d'ensemble

L'API a été restructurée pour séparer clairement la gestion des albums et des photos tout en gardant une structure d'URL logique. Les photos sont gérées via le module Albums mais avec une séparation claire des responsabilités.

## Structure des modules

### 1. Module Albums (`/src/albums/`)

**Responsabilités :**
- Gestion des albums (CRUD)
- Métadonnées des albums (titre, description, couverture)
- Relations avec les utilisateurs
- **Gestion des photos** (via PhotosService)

**Endpoints :**
- `POST /albums` - Créer un album
- `GET /albums` - Lister tous les albums de l'utilisateur
- `GET /albums/:id` - Récupérer un album spécifique (sans les photos)
- `PATCH /albums/:id` - Mettre à jour un album
- `DELETE /albums/:id` - Supprimer un album

**Endpoints Photos :**
- `GET /albums/:id/photos` - Récupérer les miniatures des photos d'un album
- `GET /albums/:albumId/photos/:photoId` - Récupérer une photo spécifique (taille réelle)
- `POST /albums/:id/photos` - Ajouter une photo à un album
- `PATCH /albums/:albumId/photos/:photoId` - Mettre à jour une photo
- `DELETE /albums/:albumId/photos/:photoId` - Supprimer une photo
- `GET /albums/uploads/:userId/:albumId/:filename` - Servir une image
- `GET /albums/uploads/:userId/:albumId/thumbnails/:filename` - Servir une miniature

**Entités :**
- `Album` - Représente un album avec ses métadonnées

### 2. Module Photos (`/src/photos/`)

**Responsabilités :**
- Service de gestion des photos (injecté dans AlbumsController)
- Traitement et compression des images
- Génération de miniatures
- Stockage des fichiers
- Logique métier des photos

**Entités :**
- `Photo` - Représente une photo avec ses métadonnées et URLs

## Structure des URLs

### Albums
- `GET /albums` - Liste des albums
- `GET /albums/:id` - **Info de l'album sans les photos**

### Photos
- `GET /albums/:id/photos` - **Photos de l'album (miniatures uniquement)**
- `GET /albums/:id/photos/:id` - **Photo spécifique (taille réelle)**
- `POST /albums/:id/photos` - Ajouter une photo
- `PATCH /albums/:id/photos/:id` - Modifier une photo
- `DELETE /albums/:id/photos/:id` - Supprimer une photo

## Avantages de cette structure

### 1. **URLs logiques et RESTful**
- Les photos restent sous le chemin des albums : `/albums/:id/photos`
- Structure intuitive et facile à comprendre

### 2. **Séparation des responsabilités**
- **AlbumsController** : Gère les routes et la logique de routage
- **PhotosService** : Gère la logique métier des photos
- **AlbumsService** : Gère la logique métier des albums

### 3. **Maintenance et scalabilité**
- Code organisé et modulaire
- Possibilité d'évoluer indépendamment
- Tests plus ciblés

### 4. **Performance**
- `/albums/:id` retourne seulement les infos de l'album (pas de photos)
- `/albums/:id/photos` retourne les miniatures (plus légères)
- `/albums/:id/photos/:id` retourne la photo complète

## Relations entre modules

### Dépendances
- **AlbumsModule** importe **PhotosModule**
- **AlbumsController** utilise **PhotosService**
- **PhotosService** peut accéder aux albums via TypeORM

### Communication
- Les modules communiquent via l'injection de dépendance
- Pas de couplage direct entre les contrôleurs

## Exemples d'utilisation

### 1. Récupérer les infos d'un album (sans photos)
```typescript
const album = await fetch('/albums/123', {
  headers: { 'Authorization': 'Bearer <token>' }
});
// Retourne : { id: '123', title: 'Vacances', description: '...', createdAt: '...' }
```

### 2. Récupérer les photos d'un album (miniatures)
```typescript
const photos = await fetch('/albums/123/photos', {
  headers: { 'Authorization': 'Bearer <token>' }
});
// Retourne : { photos: [{ id: '1', thumbnailUrl: '...', ... }], total: 5 }
```

### 3. Récupérer une photo spécifique (taille réelle)
```typescript
const photo = await fetch('/albums/123/photos/1', {
  headers: { 'Authorization': 'Bearer <token>' }
});
// Retourne : { id: '1', imageUrl: '...', thumbnailUrl: '...', ... }
```

### 4. Ajouter une photo à un album
```typescript
const photo = await fetch('/albums/123/photos', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>' },
  body: JSON.stringify({
    image: 'base64_encoded_image_data'
  })
});
```

## Configuration requise

### Dépendances
- `sharp` - Pour le traitement des images
- `@nestjs/typeorm` - Pour la gestion des entités
- `@nestjs/common` - Pour les décorateurs et composants NestJS

### Variables d'environnement
- Configuration de la base de données
- Limites de taille des fichiers (actuellement 50MB max)

## Sécurité

- Tous les endpoints sont protégés par `JwtAuthGuard`
- Vérification de la propriété des ressources (utilisateur → album → photo)
- Validation des types de fichiers et des tailles
- Stockage sécurisé par utilisateur

## Performance

- **Album sans photos** : Chargement rapide des métadonnées
- **Liste des photos** : Miniatures optimisées pour les listes
- **Photo individuelle** : Image complète à la demande
- Compression automatique des images en WebP
- Génération de miniatures pour les listes
- Pagination des résultats
- Stockage local optimisé
