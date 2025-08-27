# 🗄️ Configuration de la base de données PostgreSQL

## 📋 Prérequis

1. **PostgreSQL installé** sur votre machine
2. **Node.js** et **npm** installés
3. **Git** pour cloner le projet

## 🚀 Installation et configuration

### 1. Installer PostgreSQL

#### Windows
- Téléchargez PostgreSQL depuis [postgresql.org](https://www.postgresql.org/download/windows/)
- Installez avec l'utilisateur par défaut `postgres`
- Notez le mot de passe que vous définissez

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Créer la base de données

Connectez-vous à PostgreSQL :
```bash
# Windows (si ajouté au PATH)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

Créez la base de données :
```sql
CREATE DATABASE leonaar;
CREATE USER leonaar_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE leonaar TO leonaar_user;
\q
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :
```env
# Configuration de la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=leonaar

# Configuration de l'application
NODE_ENV=development
PORT=4000

# Configuration des images
MAX_IMAGE_SIZE=50MB
UPLOAD_FOLDER=uploads
```

### 4. Installer les dépendances

```bash
npm install
```

### 5. Démarrer l'application

```bash
npm run start:dev
```

## 🔍 Vérification

L'application devrait démarrer et vous devriez voir :
```
🔄 Synchronisation des photos existantes...
✅ Synchronisation terminée : 0 photos trouvées
📸 Prochain ID de photo : 1
🚀 Application démarrée sur http://localhost:4000
```

## 🗂️ Structure de la base de données

### Table `albums`
- `id` (UUID, Primary Key)
- `title` (VARCHAR 255, NOT NULL)
- `description` (TEXT, nullable)
- `coverImage` (VARCHAR 500, nullable)
- `createdAt` (TIMESTAMP WITH TIME ZONE)
- `updatedAt` (TIMESTAMP WITH TIME ZONE, nullable)

### Table `photos`
- `id` (UUID, Primary Key)
- `imageUrl` (VARCHAR 500, NOT NULL)
- `thumbnailUrl` (VARCHAR 500, NOT NULL)
- `fileName` (VARCHAR 255, NOT NULL)
- `thumbnailFileName` (VARCHAR 255, NOT NULL)
- `createdAt` (TIMESTAMP WITH TIME ZONE)
- `updatedAt` (TIMESTAMP WITH TIME ZONE, nullable)
- `albumId` (UUID, Foreign Key vers albums.id)

## 🛠️ Commandes utiles

### Se connecter à la base de données
```bash
psql -U postgres -d leonaar
```

### Lister les tables
```sql
\dt
```

### Voir la structure d'une table
```sql
\d albums
\d photos
```

### Voir les données
```sql
SELECT * FROM albums;
SELECT * FROM photos;
```

## 🚨 Dépannage

### Erreur de connexion
- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans le fichier `.env`
- Vérifiez que la base de données `leonaar` existe

### Erreur de permissions
- Vérifiez que l'utilisateur a les droits sur la base de données
- Vérifiez que l'utilisateur peut créer des tables

### Erreur de port
- Vérifiez que le port 5432 n'est pas utilisé par une autre instance PostgreSQL
- Modifiez le port dans le fichier `.env` si nécessaire
