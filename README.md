# 📸 Leonaar - API de gestion d'albums photos

API backend moderne et performante pour la gestion d'albums photos, construite avec NestJS, TypeORM et PostgreSQL.

## ✨ Fonctionnalités

- 🖼️ **Gestion d'albums** : CRUD complet pour les albums photos
- 📸 **Upload d'images** : Support des formats multiples avec compression WebP
- 🎯 **Miniatures automatiques** : Génération de miniatures optimisées
- 🔍 **Pagination intelligente** : Navigation fluide dans les collections
- 🗄️ **Base de données robuste** : Persistance PostgreSQL avec TypeORM
- 🚀 **Performance optimisée** : Compression d'images et cache intelligent
- 🔒 **Sécurité renforcée** : Validation des données et gestion des erreurs

## 🛠️ Technologies utilisées

- **Backend** : [NestJS](https://nestjs.com/) - Framework Node.js moderne
- **Base de données** : [PostgreSQL](https://www.postgresql.org/) avec [TypeORM](https://typeorm.io/)
- **Traitement d'images** : [Sharp](https://sharp.pixelplumbing.com/) pour la compression WebP
- **Gestion des processus** : [PM2](https://pm2.keymetrics.io/) pour la production
- **Validation** : DTOs et validation automatique NestJS
- **Documentation** : Swagger/OpenAPI intégré

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ 
- PostgreSQL 15+
- npm ou yarn

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/leonaar-back.git
cd leonaar-back

# Installer les dépendances
npm install

# Configuration de l'environnement
cp env.example .env
# Éditer .env avec vos paramètres de base de données

# Créer la base de données PostgreSQL
# Voir DATABASE_SETUP.md pour les détails

# Lancer l'application
npm run start:dev
```

### Variables d'environnement

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=leonaar

# Application
NODE_ENV=development
PORT=4000

# Images
MAX_IMAGE_SIZE=50MB
UPLOAD_FOLDER=uploads
```

## 📚 API Endpoints

### Albums
- `GET /albums` - Liste des albums
- `POST /albums` - Créer un album
- `GET /albums/:id` - Détails d'un album
- `PATCH /albums/:id` - Modifier un album
- `DELETE /albums/:id` - Supprimer un album

### Photos
- `GET /albums/:id/photos` - Photos d'un album (avec pagination)
- `GET /albums/:id/photos/thumbnails` - Miniatures d'un album
- `POST /albums/:id/photos` - Ajouter une photo
- `GET /albums/:id/photos/:photoId` - Détails d'une photo
- `PATCH /albums/:id/photos/:photoId` - Modifier une photo
- `DELETE /albums/:id/photos/:photoId` - Supprimer une photo

### Paramètres de pagination
- `limit` : Nombre maximum de photos (optionnel)
- `offset` : Décalage pour la pagination (défaut: 0)
- `order` : Ordre de tri ('asc' ou 'desc', défaut: 'desc')

## 🗄️ Structure de la base de données

### Table `albums`
- `id` : UUID (clé primaire)
- `title` : Titre de l'album
- `description` : Description optionnelle
- `coverImage` : Image de couverture
- `createdAt` : Date de création
- `updatedAt` : Date de modification

### Table `photos`
- `id` : UUID (clé primaire)
- `imageUrl` : URL de l'image principale
- `thumbnailUrl` : URL de la miniature
- `fileName` : Nom du fichier principal
- `thumbnailFileName` : Nom du fichier miniature
- `albumId` : Référence vers l'album (clé étrangère)
- `createdAt` : Date de création
- `updatedAt` : Date de modification

## 🖼️ Gestion des images

### Formats supportés
- **Entrée** : JPEG, PNG, GIF, WebP, TIFF
- **Sortie** : WebP optimisé avec compression intelligente

### Optimisations automatiques
- Compression WebP avec qualité configurable
- Redimensionnement automatique (max 1920x1080px)
- Génération de miniatures 300x300px
- Cache et headers d'expiration optimisés

### Structure des dossiers
```
uploads/
├── [album-id]/
│   ├── photo_1.webp
│   ├── photo_2.webp
│   └── thumbnails/
│       ├── photo_1.webp
│       └── photo_2.webp
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

## 🚀 Déploiement

### Scripts disponibles
- `npm run build` - Build de production
- `npm run start:prod` - Démarrage en production
- `npm run db:seed` - Peuplement de la base de données

### Déploiement en production
Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour un guide complet de déploiement sur VPS OVH.

## 📖 Documentation

- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Guide de déploiement en production
- [**DATABASE_SETUP.md**](./DATABASE_SETUP.md) - Configuration de la base de données
- [**ALBUMS_API.md**](./ALBUMS_API.md) - Documentation détaillée de l'API

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [NestJS](https://nestjs.com/) pour le framework backend
- [TypeORM](https://typeorm.io/) pour l'ORM
- [Sharp](https://sharp.pixelplumbing.com/) pour le traitement d'images
- [PostgreSQL](https://www.postgresql.org/) pour la base de données

## 📞 Support

Pour toute question ou problème :
- Ouvrir une [issue](https://github.com/votre-username/leonaar-back/issues)
- Consulter la [documentation](./DEPLOYMENT.md)

---

**Leonaar** - Gardez vos souvenirs photos organisés et accessibles ! 📸✨
