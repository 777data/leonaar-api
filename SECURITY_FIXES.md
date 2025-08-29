# 🔒 Corrections de Sécurité - Protection des Photos

## 🚨 Problème Identifié

**VULNÉRABILITÉ CRITIQUE** : Les photos étaient exposées publiquement sans authentification.

### Détails du problème :
- L'application utilisait `Express.static` pour servir directement tous les fichiers du dossier `uploads/`
- Route publique : `/uploads/userId/albumId/photo.webp`
- **Aucune vérification JWT** n'était effectuée
- **N'importe qui** pouvait accéder aux photos de n'importe quel utilisateur

## ✅ Solutions Implémentées

### 1. Suppression de la Route Statique
**Fichier modifié** : `src/main.ts`

**AVANT** (non sécurisé) :
```typescript
// ❌ DANGEREUX : Expose toutes les photos publiquement
app.use('/uploads', staticFiles(uploadsPath, {
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));
```

**APRÈS** (sécurisé) :
```typescript
// ✅ SÉCURISÉ : Aucune route statique pour les uploads
// Les photos ne sont accessibles que via les endpoints authentifiés
```

### 2. Utilisation Exclusive des Endpoints Sécurisés
Toutes les photos passent maintenant par les endpoints protégés par JWT :

- `GET /albums/:albumId/photos` - Liste des photos (protégé par JWT)
- `GET /albums/:albumId/photos/:photoId` - Détail d'une photo (protégé par JWT)
- `GET /albums/uploads/:userId/:albumId/:filename` - Fichier photo (protégé par JWT)
- `GET /albums/uploads/:userId/:albumId/thumbnails/:filename` - Miniature (protégé par JWT)

### 3. Vérification des Permissions
**Fichier** : `src/photos/photos.service.ts`

Chaque accès aux photos vérifie :
```typescript
private async verifyAlbumOwnership(userId: string, albumId: string): Promise<Album> {
  const album = await this.albumRepository.findOne({ 
    where: { userId, id: albumId } 
  });
  if (!album) {
    throw new NotFoundException(`Album with ID ${albumId} not found`);
  }
  return album;
}
```

## 🔐 Niveaux de Sécurité

### Niveau 1 : Authentification JWT
- Tous les endpoints de photos nécessitent un token JWT valide
- Utilisation du `JwtAuthGuard` sur tous les contrôleurs

### Niveau 2 : Vérification de Propriété
- L'utilisateur ne peut accéder qu'à ses propres albums
- Vérification que `req.user.id === userId` dans les endpoints de fichiers

### Niveau 3 : Isolation des Données
- Chaque utilisateur a son propre dossier : `uploads/userId/`
- Impossible d'accéder aux fichiers d'autres utilisateurs

## 🧪 Tests de Sécurité

Utilisez le fichier `test-security.js` pour vérifier que la sécurité fonctionne :

```bash
node test-security.js
```

**Résultats attendus** :
- ✅ Accès direct aux photos impossible
- ✅ Endpoints protégés retournent 401 Unauthorized
- ✅ Route statique `/uploads` supprimée

## 📱 Impact sur le Frontend

### Avant (non sécurisé) :
```typescript
// ❌ Accès direct aux photos
const photoUrl = `http://api.com/uploads/${userId}/${albumId}/${filename}`;
```

### Après (sécurisé) :
```typescript
// ✅ Accès via endpoint authentifié
const photoUrl = `http://api.com/albums/uploads/${userId}/${albumId}/${filename}`;
// Avec header Authorization: Bearer <JWT_TOKEN>
```

## 🚀 Déploiement

1. **Redémarrer l'API** après les modifications
2. **Vérifier** que les anciennes URLs directes ne fonctionnent plus
3. **Tester** l'authentification sur tous les endpoints de photos
4. **Mettre à jour** le frontend pour utiliser les nouveaux endpoints

## 🔍 Vérification Post-Déploiement

```bash
# Test d'accès non autorisé (devrait échouer)
curl http://localhost:4000/uploads/1/photo_2.webp

# Test d'accès autorisé (devrait réussir avec JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:4000/albums/uploads/1/1/photo_2.webp
```

## 📚 Ressources

- [NestJS Guards Documentation](https://docs.nestjs.com/guards)
- [JWT Strategy Implementation](src/auth/strategies/jwt.strategy.ts)
- [Photos Service Security](src/photos/photos.service.ts)
- [Albums Controller Security](src/albums/albums.controller.ts)
