# SIGL - Système d'Information de Gestion de Liaison

## Introduction au projet

SIGL est une plateforme web pensée pour orchestrer les relations entre étudiants, entreprises et établissements d'enseignement. C'est un système complet qui traite la coordination des stages, des soutenances, des entretiens et du suivi pédagogique.

### Fonctionnalités principales

- **Authentification sécurisée** avec JWT et authentification multi-facteurs (MFA).
- **Gestion des entretiens** et planification des créneaux.
- **Système de soutenances** avec gestion des jurys. 
- **Tableau de bord personnalisé** selon le rôle utilisateur. Chacun voit ce qui le concerne.
- **Journal de bord** pour le suivi des activités. La traçabilité, c'est important.
- **Système de rôles** (Étudiant, Entreprise, Administrateur). 

## Stack technique

- **Backend**: Node.js 16+ avec Express.js, MongoDB et Mongoose
- **Frontend**: React 18, Vite pour la vitesse, Tailwind CSS
- **Base de données**: MongoDB 5.0+
- **Authentification**: JWT avec refresh tokens et MFA
- **Sécurité**: Helmet, CORS, rate limiting, bcrypt
- **Tests API**: Bruno (collection incluse dans le projet)

## Prérequis système

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- **Node.js** version 16.0.0 ou supérieure
- **npm** version 8.0.0 ou supérieure
- **MongoDB** version 5.0.0 ou supérieure
- **Git** pour le clonage du repository

### Vérification des versions

```bash
node --version
npm --version
mongod --version
git --version
```

## Installation étape par étape

### 1. Cloner le repository

```bash
git clone <url-du-repository>
cd SIGL_projet
```

### 2. Installation des dépendances du backend

```bash
cd sigl_backend
npm install
```

### 3. Installation des dépendances du frontend

```bash
cd ../sigl_frontend
npm install
```

### 4. Retour à la racine du projet

```bash
cd ..
```

## Configuration des variables d'environnement

### Backend (.env)

Créez un fichier `.env` dans le dossier `sigl_backend/` avec le contenu suivant :

```env
# Secrets JWT (IMPORTANT: Changez ces valeurs en production)
JWT_SECRET=your-very-strong-secret-key-min-32-chars-for-access-tokens-2024
JWT_REFRESH_SECRET=another-strong-secret-for-refresh-tokens-must-be-different-2024

# Configuration de sécurité
BCRYPT_SALT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME=900000

# Configuration serveur
NODE_ENV=development
PORT=3000

# Base de données
MONGODB_URI=mongodb://localhost:27017/database

# Configuration SMTP (Mailtrap pour le développement)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=cc40f8c68deca9
SMTP_PASS=bb9da2e2951b72
SMTP_FROM="SKILIO" <no-reply@skilio.local>

# URL du frontend
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Créez un fichier `.env` dans le dossier `sigl_frontend/` avec le contenu suivant :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:3000/api
```

## Démarrage du serveur de développement

### 1. Démarrer MongoDB

Assurez-vous que MongoDB est en cours d'exécution :

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# ou
brew services start mongodb-community
```

### 2. Démarrer le backend

Dans un premier terminal :

```bash
cd sigl_backend
npm run dev
```

Le serveur backend sera accessible sur `http://localhost:3000`

### 3. Démarrer le frontend

Dans un second terminal :

```bash
cd sigl_frontend
npm run dev
```

Le serveur frontend sera accessible sur `http://localhost:5173`

## Informations sur les ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Backend API | 3000 | http://localhost:3000 | Serveur Express.js |
| Frontend Dev | 5173 | http://localhost:5173 | Serveur de développement Vite |
| Frontend Preview | 4173 | http://localhost:4173 | Serveur de prévisualisation Vite |
| MongoDB | 27017 | mongodb://localhost:27017 | Base de données MongoDB |

## Tests disponibles

### Tests API avec Bruno

Le projet inclut une collection complète de tests API dans le dossier `API_test/`.

1. **Installer Bruno** : [https://usebruno.com/](https://usebruno.com/)
2. **Ouvrir la collection** : Fichier → Ouvrir Collection → Sélectionner le dossier `API_test`
3. **Configurer l'environnement** : Utiliser l'environnement "local" pré-configuré

### Tests inclus

- **Authentification** : Login, logout, refresh token, MFA
- **Gestion utilisateurs** : CRUD complet, profils, rôles
- **Entretiens** : Demande, confirmation, annulation
- **Soutenances** : Planification, gestion des jurys
- **Tests généraux** : Santé de l'API, connectivité

### Commandes npm

```bash
# Backend
cd sigl_backend
npm run dev          # Démarrage en mode développement
npm start           # Démarrage en mode production
npm run test        # Exécution des tests (si configurés)

# Frontend
cd sigl_frontend
npm run dev         # Serveur de développement
npm run build       # Build de production
npm run preview     # Prévisualisation du build
npm run lint        # Vérification du code
```

## Section de dépannage

### Erreur : "Cannot connect to MongoDB"

**Solution :**
```bash
# Vérifier si MongoDB est démarré
# Windows
sc query MongoDB

# macOS/Linux
sudo systemctl status mongod

# Redémarrer MongoDB si nécessaire
# Windows
net stop MongoDB && net start MongoDB

# macOS/Linux
sudo systemctl restart mongod
```

### Erreur : "Port 3000 already in use"

**Solution :**
```bash
# Trouver le processus utilisant le port
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Tuer le processus (remplacer PID par l'ID du processus)
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

### Erreur : "Module not found"

**Solution :**
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Ou utiliser npm ci pour une installation propre
npm ci
```


### Erreur : "CORS policy"

**Solution :**
Vérifier que `FRONTEND_URL` dans le fichier `.env` du backend correspond à l'URL du frontend.

### Base de données vide

**Solution :**
```bash
# Restaurer la base de données depuis le dump
cd database
mongorestore --db database ./database/
```

### Logs et débogage

- **Backend logs** : Consultez la console du terminal backend
- **Frontend logs** : Ouvrez les DevTools du navigateur (F12)
- **MongoDB logs** : Vérifiez les logs MongoDB dans `/var/log/mongodb/` (Linux/macOS)

## Documentation supplémentaire

### Liens utiles

- **Documentation React** : [https://react.dev/](https://react.dev/)
- **Documentation Vite** : [https://vitejs.dev/](https://vitejs.dev/)
- **Documentation Tailwind CSS** : [https://tailwindcss.com/](https://tailwindcss.com/)
- **Documentation Express.js** : [https://expressjs.com/](https://expressjs.com/)
- **Documentation MongoDB** : [https://docs.mongodb.com/](https://docs.mongodb.com/)
- **Documentation JWT** : [https://jwt.io/](https://jwt.io/)
- **Documentation Bruno** : [https://docs.usebruno.com/](https://docs.usebruno.com/)

### Structure du projet

```
SIGL_projet/
├── sigl_backend/             # API Backend Node.js/Express
│   ├── app/                  # Code source de l'application
│   │   ├── auth/             # Authentification et sécurité
│   │   ├── user/             # Gestion des utilisateurs
│   │   ├── entretien/        # Gestion des entretiens
│   │   ├── soutenance/       # Gestion des soutenances
│   │   └── middleware/       # Middlewares Express
│   └── .env                  # Variables d'environnement backend
├── sigl_frontend/            # Application React
│   ├── src/                  # Code source React
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages de l'application
│   │   └── services/         # Services API
│   └── .env                  # Variables d'environnement frontend
├── API_test/                 # Collection de tests Bruno
├── database/                 # Dump de la base de données
└── README.md                 # Ce fichier
```

### Rôles et permissions

| Rôle | Permissions |
|------|-------------|
| Étudiant | Consulter offres, demander entretiens, gérer son profil, journal de bord |
| Entreprise | Publier offres, gérer entretiens, consulter profils étudiants |
| Administrateur | Gestion complète, modération, configuration système |
