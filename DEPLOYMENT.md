# 🚀 Guide de déploiement en production - VPS OVH

Guide complet pour déployer l'application leonaar sur un VPS OVH en production.

## 📋 Table des matières

1. [Prérequis et préparation](#1-prérequis-et-préparation)
2. [Configuration du VPS](#2-configuration-du-vps)
3. [Installation des services](#3-installation-des-services)
4. [Configuration de l'application](#4-configuration-de-lapplication)
5. [Déploiement](#5-déploiement)
6. [Configuration Nginx](#6-configuration-nginx)
7. [SSL et domaine](#7-ssl-et-domaine)
8. [Monitoring et maintenance](#8-monitoring-et-maintenance)
9. [Sécurité](#9-sécurité)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prérequis et préparation

### 🛠️ Outils nécessaires
- VPS OVH avec Ubuntu 22.04 LTS ou Debian 12
- Accès SSH root
- Domaine configuré (optionnel mais recommandé)
- Client Git sur votre machine locale

---

## 2. Configuration du VPS

### 🔐 Connexion initiale
```bash
# Connexion SSH
ssh root@VOTRE_IP_VPS

# Mise à jour du système
apt update && apt upgrade -y

# Installation des paquets essentiels
apt install -y curl wget git unzip software-properties-common
```

### 👤 Création d'un utilisateur dédié
```bash
# Créer un utilisateur pour l'application
adduser leonaar
usermod -aG sudo leonaar

# Passer à l'utilisateur leonaar
su - leonaar
```

---

## 3. Installation des services

### 🐳 Installation de Docker et Docker Compose
```bash
# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Installation de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session pour appliquer les groupes
exit
ssh leonaar@VOTRE_IP_VPS
```

### 🐘 Installation de PostgreSQL (alternative à Docker)
```bash
# Installation de PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Démarrer et activer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configuration de l'utilisateur
sudo -u postgres createuser --interactive leonaar
sudo -u postgres createdb leonaar
```

### 🟢 Installation de Node.js
```bash
# Installation de Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification des versions
node --version
npm --version

# Installation de PM2 pour la gestion des processus
sudo npm install -g pm2
```

---

## 4. Configuration de l'application

### 📁 Création de la structure
```bash
# Créer le dossier de l'application
mkdir -p /home/leonaar/app
cd /home/leonaar/app

# Cloner votre repository (ou uploader les fichiers)
git clone https://github.com/777data/leonaar-api.git .
# OU utiliser scp pour uploader les fichiers
```

### ⚙️ Configuration de l'environnement
```bash
# Créer le fichier .env de production
cat > .env << EOF
# Configuration de la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=leonaar
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE
DB_NAME=leonaar

# Configuration de l'application
NODE_ENV=production
PORT=4000

# Configuration des images
MAX_IMAGE_SIZE=50MB
UPLOAD_FOLDER=uploads
EOF

# Sécuriser le fichier .env
chmod 600 .env
```

### 🗄️ Configuration de la base de données
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer l'utilisateur et la base
CREATE USER leonaar WITH ENCRYPTED PASSWORD 'leonaar';
CREATE DATABASE leonaar OWNER leonaar;
GRANT ALL PRIVILEGES ON DATABASE leonaar TO leonaar;
\q

# Tester la connexion
psql -h localhost -U leonaar -d leonaar
```

---

## 5. Déploiement

### 📦 Installation des dépendances
```bash
# Installation des dépendances
npm ci --only=production

# Build de l'application
npm run build

# Créer le dossier uploads
mkdir -p uploads
chmod 755 uploads
```

### 🚀 Démarrage avec PM2
```bash
# Créer le fichier ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'leonaar-back',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Créer le dossier logs
mkdir logs

# Démarrer l'application
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

---

## 6. Configuration Nginx

### 🌐 Installation de Nginx
```bash
sudo apt install -y nginx

# Démarrer et activer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### ⚙️ Configuration du site
```bash
# Créer la configuration du site
sudo tee /etc/nginx/sites-available/leonaar << EOF
server {
    listen 80;
    server_name VOTRE_DOMAINE.com www.VOTRE_DOMAINE.com;

    # Redirection des logs
    access_log /var/log/nginx/leonaar_access.log;
    error_log /var/log/nginx/leonaar_error.log;

    # Configuration des fichiers statiques
    location /uploads/ {
        # Désactiver l'accès direct aux fichiers
        deny all;
    }

    # Proxy vers l'application NestJS
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Limites de taille pour les uploads
    client_max_body_size 50M;
}
EOF

# Activer le site
sudo ln -s /etc/nginx/sites-available/leonaar /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 7. SSL et domaine

### 🔒 Installation de Certbot (Let's Encrypt)
```bash
# Installation de Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d VOTRE_DOMAINE.com -d www.VOTRE_DOMAINE.com

# Renouvellement automatique
sudo crontab -e
# Ajouter cette ligne :
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 8. Monitoring et maintenance

### 📊 Monitoring avec PM2
```bash
# Voir les processus
pm2 status

# Voir les logs
pm2 logs leonaar-back

# Redémarrer l'application
pm2 restart leonaar-back

# Monitoring en temps réel
pm2 monit
```

### 🔄 Script de déploiement automatique
```bash
# Créer un script de déploiement
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Déploiement de leonaar..."

# Pull des dernières modifications
git pull origin main

# Installation des dépendances
npm ci --only=production

# Build de l'application
npm run build

# Redémarrage de l'application
pm2 restart leonaar-back

echo "✅ Déploiement terminé !"
EOF

chmod +x deploy.sh
```

### 📈 Monitoring système
```bash
# Installation d'outils de monitoring
sudo apt install -y htop iotop nethogs

# Vérification de l'espace disque
df -h

# Vérification de la mémoire
free -h

# Vérification des processus
htop
```

---

## 9. Sécurité

### 🛡️ Configuration du firewall
```bash
# Installation d'ufw
sudo apt install -y ufw

# Configuration des règles
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Activation du firewall
sudo ufw enable
```

### 🔐 Sécurisation de PostgreSQL
```bash
# Éditer la configuration PostgreSQL
sudo nano /etc/postgresql/*/main/postgresql.conf

# Ajouter/modifier :
# listen_addresses = 'localhost'

# Éditer pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# S'assurer que seuls les utilisateurs locaux peuvent se connecter
```

---

## 10. Troubleshooting

### 📝 Logs et debugging
```bash
# Logs de l'application
tail -f /home/leonaar/app/logs/combined.log

# Logs de Nginx
sudo tail -f /var/log/nginx/leonaar_error.log

# Logs système
sudo journalctl -u nginx -f
```

### 🔄 Maintenance
```bash
# Redémarrage complet
sudo systemctl restart nginx
pm2 restart leonaar-back

# Vérification des services
sudo systemctl status nginx
pm2 status
```

### 🔍 Debugging avancé
```bash
# Vérifier les processus
ps aux | grep node
ps aux | grep nginx

# Vérifier les ports
netstat -tlnp | grep :4000
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Vérifier les permissions
ls -la /home/leonaar/app/uploads/
ls -la /home/leonaar/app/
```

---

## 📋 Checklist de déploiement

- [ ] VPS configuré et sécurisé
- [ ] Services installés (Node.js, PostgreSQL, Nginx)
- [ ] Application déployée et configurée
- [ ] Base de données initialisée
- [ ] Nginx configuré et testé
- [ ] SSL configuré (si domaine)
- [ ] Monitoring et logs configurés
- [ ] Firewall activé
- [ ] Tests de fonctionnement effectués

---

## 🚨 Problèmes courants

### ❌ Port 4000 bloqué
**Symptôme :** Impossible de se connecter à l'application
**Solution :** Vérifier le firewall et la configuration Nginx

### ❌ Erreur de base de données
**Symptôme :** Erreurs de connexion PostgreSQL
**Solution :** Vérifier les permissions et la configuration de l'utilisateur

### ❌ Images non accessibles
**Symptôme :** Erreur 404 sur les fichiers uploads
**Solution :** Vérifier les permissions du dossier uploads et la configuration Nginx

### ❌ SSL non fonctionnel
**Symptôme :** Certificat non reconnu
**Solution :** Vérifier la configuration Certbot et les redirections Nginx

---

## 📞 Support et ressources

### 🔗 Liens utiles
- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation PM2](https://pm2.keymetrics.io/docs/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)

### 📚 Commandes de référence
```bash
# PM2
pm2 start ecosystem.config.js    # Démarrer l'application
pm2 stop leonaar-back           # Arrêter l'application
pm2 restart leonaar-back        # Redémarrer l'application
pm2 logs leonaar-back           # Voir les logs
pm2 monit                       # Monitoring en temps réel

# Nginx
sudo nginx -t                   # Tester la configuration
sudo systemctl restart nginx    # Redémarrer Nginx
sudo systemctl status nginx     # Statut du service

# PostgreSQL
sudo systemctl status postgresql    # Statut du service
sudo -u postgres psql              # Connexion admin
```

---

## 🎯 Conclusion

Ce guide vous donne tous les éléments nécessaires pour déployer votre application leonaar en production sur un VPS OVH. 

**Points clés à retenir :**
- ✅ Configuration sécurisée des services
- ✅ Déploiement automatisé avec PM2
- ✅ Reverse proxy Nginx pour les performances
- ✅ SSL automatique avec Let's Encrypt
- ✅ Monitoring et maintenance continue

**Prochaines étapes recommandées :**
1. Tester le déploiement sur un environnement de staging
2. Configurer des sauvegardes automatiques
3. Mettre en place un monitoring avancé (Prometheus, Grafana)
4. Configurer des alertes en cas de problème

---

*Documentation créée pour leonaar - Application de gestion d'albums photos*
*Dernière mise à jour : Août 2025*
