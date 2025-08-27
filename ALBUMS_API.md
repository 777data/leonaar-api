# API Albums Photo

Cette API permet de gérer une liste d'albums photo avec les opérations CRUD complètes.

## Structure d'un Album

Un album est composé des champs suivants :
- `id` : Identifiant unique de l'album (généré automatiquement)
- `title` : Titre de l'album
- `description` : Description de l'album
- `image` : URL ou chemin de l'image de l'album
- `createdAt` : Date de création de l'album

## Endpoints

### 1. Créer un album
**POST** `/albums`

**Body :**
```json
{
  "title": "Vacances d'été",
  "description": "Photos de nos vacances en Bretagne",
  "image": "https://example.com/vacances.jpg"
}
```

**Note :** Le champ `createdAt` est automatiquement généré.

### 2. Récupérer tous les albums
**GET** `/albums`

**Response :**
```json
[
  {
    "id": "1",
    "title": "Vacances d'été",
    "description": "Photos de nos vacances en Bretagne",
    "image": "https://example.com/vacances.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3. Récupérer un album par ID
**GET** `/albums/:id`

**Response :**
```json
{
  "id": "1",
  "title": "Vacances d'été",
  "description": "Photos de nos vacances en Bretagne",
  "image": "https://example.com/vacances.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Mettre à jour un album
**PATCH** `/albums/:id`

**Body :** (tous les champs sont optionnels)
```json
{
  "title": "Vacances d'été 2024",
  "description": "Photos de nos vacances en Bretagne - édition 2024"
}
```

### 5. Supprimer un album
**DELETE** `/albums/:id`

**Response :** Aucun contenu (204)

## Gestion des erreurs

- **404 Not Found** : L'album avec l'ID spécifié n'existe pas
- **400 Bad Request** : Données invalides dans le body de la requête

## Exemples d'utilisation avec cURL

### Créer un album
```bash
curl -X POST http://localhost:3000/albums \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Anniversaire",
    "description": "Photos de mon anniversaire",
    "image": "https://example.com/anniversaire.jpg"
  }'
```

### Récupérer tous les albums
```bash
curl http://localhost:3000/albums
```

### Mettre à jour un album
```bash
curl -X PATCH http://localhost:3000/albums/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Anniversaire 2024"
  }'
```

### Supprimer un album
```bash
curl -X DELETE http://localhost:3000/albums/1
```

## Démarrage de l'application

1. Installer les dépendances : `npm install`
2. Démarrer en mode développement : `npm run start:dev`
3. L'API sera accessible sur `http://localhost:3000`
