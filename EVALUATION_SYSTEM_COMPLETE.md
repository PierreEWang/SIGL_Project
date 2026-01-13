# 🎓 Système d'Évaluation - Documentation Complète

## 📋 Vue d'ensemble

Le système d'évaluation permet aux **tuteurs pédagogiques (TP)** d'évaluer leurs **étudiants (APPRENTI)** avec un système complet de notation, de validation de compétences et de commentaires. Les étudiants reçoivent des notifications et peuvent consulter leurs évaluations.

---

## ✨ Fonctionnalités implémentées

### 🎓 Côté Tuteur (Dashboard Tuteur)

#### 1. **Onglet "Mes Étudiants"** 👥
- Liste complète de tous les étudiants disponibles
- Cards cliquables avec photo de profil et informations
- Clic sur un étudiant → redirection vers l'onglet Évaluation avec sélection automatique

#### 2. **Onglet "Nouvelle Évaluation"** 📝
- Sélection d'un étudiant dans une liste déroulante
- Formulaire d'évaluation créatif avec :
  - **8 compétences à valider** (cases à cocher)
  - **Note sur 20** (avec décimales)
  - **Commentaire détaillé** (obligatoire)
- Validation côté client et serveur
- Message de succès avec confirmation
- Redirection automatique vers l'historique après création

#### 3. **Onglet "Historique"** 📋
- Affichage de toutes les évaluations créées par le tuteur
- Pour chaque évaluation :
  - Informations de l'étudiant
  - Note sur 20
  - Nombre de compétences validées
  - Date de création
  - **Statut de lecture** (✓ Lu / ⏳ Non lu)
  - Commentaire complet

### 🎓 Côté Étudiant (Dashboard Étudiant)

#### 4. **Onglet "Mes Évaluations"** 📊
- Badge avec compteur de nouvelles évaluations
- Liste de toutes les évaluations reçues
- Pour chaque évaluation :
  - **Mise en évidence des nouvelles** (bordure colorée + badge "NOUVEAU")
  - Informations du tuteur
  - **3 indicateurs visuels** :
    - Note sur 20
    - Compétences validées (X/8)
    - Pourcentage de progression
  - Liste des compétences avec statut (✓ validée / ○ non validée)
  - Commentaire complet du tuteur
  - Bouton "Marquer comme lu" (disparaît après lecture)
- Mise à jour automatique du compteur après lecture

---

## 🗂️ Architecture Backend

### Fichiers créés

```
sigl_backend/app/
├── common/models/
│   └── evaluation.model.js          # Modèle MongoDB
├── evaluation/
│   ├── repository.js                # Accès aux données
│   ├── service.js                   # Logique métier
│   ├── controller.js                # Gestion des requêtes
│   └── routes.js                    # Routes API
└── app.js                           # Enregistrement des routes
```

### Modèle de données (`Evaluation`)

```javascript
{
  tuteurId: ObjectId,              // Référence au tuteur (TP)
  etudiantId: ObjectId,            // Référence à l'étudiant (APPRENTI)
  note: Number,                    // Note sur 20 (0-20)
  commentaire: String,             // Commentaire du tuteur
  competences: [{                  // Liste des compétences
    id: Number,
    nom: String,
    validee: Boolean
  }],
  luParEtudiant: Boolean,          // Statut de lecture
  dateLecture: Date,               // Date de lecture
  periode: String,                 // Période (optionnel)
  createdAt: Date,                 // Date de création
  updatedAt: Date                  // Date de modification
}
```

### Routes API disponibles

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| POST | `/api/evaluations` | Créer une évaluation | TP uniquement |
| GET | `/api/evaluations/tuteur` | Toutes les évaluations du tuteur | TP uniquement |
| GET | `/api/evaluations/etudiant` | Toutes les évaluations de l'étudiant | APPRENTI uniquement |
| GET | `/api/evaluations/students` | Liste des étudiants | TP uniquement |
| GET | `/api/evaluations/unread-count` | Nombre d'évaluations non lues | APPRENTI uniquement |
| GET | `/api/evaluations/:id` | Détails d'une évaluation | TP ou APPRENTI concerné |
| PATCH | `/api/evaluations/:id/read` | Marquer comme lu | APPRENTI uniquement |
| PUT | `/api/evaluations/:id` | Modifier une évaluation | TP créateur uniquement |
| DELETE | `/api/evaluations/:id` | Supprimer une évaluation | TP créateur uniquement |

---

## 🎨 Architecture Frontend

### Fichiers créés/modifiés

```
sigl_frontend/src/
├── services/
│   └── evaluationService.js         # Service API pour les évaluations
├── pages/dashboard/
│   ├── TutorDashboard.jsx          # Dashboard tuteur (modifié)
│   └── StudentDashboard.jsx        # Dashboard étudiant (modifié)
```

### Service Frontend (`evaluationService.js`)

Méthodes disponibles :
- `createEvaluation(data)` - Créer une évaluation
- `getMyEvaluations()` - Récupérer les évaluations du tuteur
- `getMyReceivedEvaluations()` - Récupérer les évaluations de l'étudiant
- `getStudentsList()` - Liste des étudiants
- `getUnreadCount()` - Nombre d'évaluations non lues
- `markAsRead(id)` - Marquer comme lu
- `getEvaluationById(id)` - Détails d'une évaluation
- `updateEvaluation(id, data)` - Modifier
- `deleteEvaluation(id)` - Supprimer

### Modifications du TutorDashboard

**Nouveaux onglets :**
- 👥 Mes Étudiants
- 📝 Nouvelle Évaluation  
- 📋 Historique

**États ajoutés :**
```javascript
const [students, setStudents] = useState([]);
const [evaluations, setEvaluations] = useState([]);
const [selectedStudent, setSelectedStudent] = useState(null);
const [loading, setLoading] = useState(false);
```

### Modifications du StudentDashboard

**Nouvel onglet :**
- 📊 Mes Évaluations

**États ajoutés :**
```javascript
const [evaluations, setEvaluations] = useState([]);
const [evaluationsLoading, setEvaluationsLoading] = useState(false);
const [evaluationsError, setEvaluationsError] = useState(null);
const [unreadCount, setUnreadCount] = useState(0);
```

---

## 🔐 Sécurité et Autorisations

### Vérifications côté backend

1. **Authentification** : Toutes les routes nécessitent un token JWT valide
2. **Autorisation par rôle** :
   - TP peut créer, modifier, supprimer ses évaluations
   - APPRENTI peut lire ses évaluations et les marquer comme lues
3. **Validation des données** :
   - Note entre 0 et 20
   - Commentaire obligatoire
   - Compétences au format tableau

### Vérifications côté frontend

1. Validation du formulaire avant soumission
2. Messages d'erreur clairs
3. Désactivation des boutons pendant le chargement

---

## 🚀 Comment utiliser

### En tant que Tuteur

1. **Se connecter** avec un compte TP
2. **Aller dans "Mes Étudiants"** pour voir la liste
3. **Cliquer sur un étudiant** ou aller dans "Nouvelle Évaluation"
4. **Remplir le formulaire** :
   - Sélectionner l'étudiant
   - Cocher les compétences validées
   - Saisir une note
   - Écrire un commentaire
5. **Enregistrer** → L'étudiant est notifié automatiquement
6. **Consulter l'historique** dans l'onglet "Historique"

### En tant qu'Étudiant

1. **Se connecter** avec un compte APPRENTI
2. **Observer le badge** sur l'onglet "Mes Évaluations" (nombre de nouvelles)
3. **Ouvrir l'onglet** pour voir toutes les évaluations
4. **Consulter** les détails :
   - Note
   - Compétences validées
   - Commentaire du tuteur
5. **Cliquer** sur "Marquer comme lu" pour retirer le badge "NOUVEAU"

---

## 📊 Liste des compétences évaluées

1. **Conception et développement**
2. **Gestion de projet**
3. **Communication professionnelle**
4. **Travail en équipe**
5. **Résolution de problèmes**
6. **Autonomie**
7. **Adaptabilité**
8. **Rigueur et qualité du travail**

---

## 🎯 Fonctionnalités futures possibles

### Phase 2
- [ ] Historique des modifications d'une évaluation
- [ ] Export des évaluations en PDF
- [ ] Graphiques de progression pour l'étudiant
- [ ] Comparaison avec les moyennes de la promotion
- [ ] Réponse de l'étudiant au commentaire

### Phase 3
- [ ] Notifications push en temps réel
- [ ] Notifications par email
- [ ] Attribution automatique d'étudiants aux tuteurs
- [ ] Système de signatures électroniques
- [ ] Validation par un responsable pédagogique

---

## 🧪 Tests recommandés

### Tester en tant que Tuteur
1. Créer une évaluation pour un étudiant
2. Consulter l'historique
3. Vérifier que le statut est "Non lu"
4. Tenter de modifier/supprimer une évaluation

### Tester en tant qu'Étudiant
1. Se connecter avec le compte de l'étudiant évalué
2. Vérifier le badge "nouvelles évaluations"
3. Consulter l'évaluation
4. Marquer comme lu
5. Vérifier que le badge disparaît

### Tester la sécurité
1. Tenter d'accéder aux évaluations d'un autre étudiant (doit échouer)
2. Tenter de créer une évaluation en tant qu'étudiant (doit échouer)
3. Vérifier que seul le tuteur créateur peut modifier/supprimer

---

## 📝 Notes techniques

### Performance
- Les évaluations sont chargées au montage du composant
- Mise en cache côté frontend
- Index MongoDB sur `tuteurId` et `etudiantId` pour des requêtes rapides

### Extensibilité
- Le modèle de compétences est facilement extensible
- Possibilité d'ajouter d'autres champs (période, type d'évaluation, etc.)
- Architecture modulaire permettant l'ajout de nouveaux types d'évaluations

---

## ✅ Checklist de déploiement

- [x] Modèle MongoDB créé
- [x] Routes API implémentées et testées
- [x] Service frontend créé
- [x] Dashboard tuteur mis à jour
- [x] Dashboard étudiant mis à jour
- [x] Système de notifications fonctionnel
- [x] Validation des données (client + serveur)
- [x] Gestion des erreurs
- [x] Design responsive

---

**Version** : 1.0  
**Date** : Janvier 2026  
**Statut** : ✅ Système complet et fonctionnel
