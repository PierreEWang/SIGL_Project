# Dashboard Tuteur - Documentation

## 📋 Vue d'ensemble

Le **Dashboard Tuteur** est une interface dédiée aux tuteurs/enseignants pour gérer et évaluer leurs étudiants.

## ✨ Fonctionnalités

### 1. **Onglet Profil** 👤
- Affichage des informations personnelles du tuteur
- Prénom, nom, email, téléphone
- Spécialité et département (si disponibles)
- Avatar avec initiales
- Bouton pour modifier le profil (redirige vers `/profile`)

### 2. **Onglet Calendrier** 📅
- Vue simplifiée du calendrier
- Bouton d'accès au calendrier complet
- Permet de consulter les événements, soutenances et entretiens programmés
- Intégration avec la page calendrier existante

### 3. **Onglet Évaluation** 📝
Le module d'évaluation comprend :

#### Sélection de l'étudiant
- Liste déroulante pour choisir l'étudiant à évaluer
- (À connecter avec l'API pour récupérer la liste réelle des étudiants)

#### Formulaire d'évaluation créatif

**Compétences validées** 🎯
- 8 compétences prédéfinies :
  - Conception et développement
  - Gestion de projet
  - Communication professionnelle
  - Travail en équipe
  - Résolution de problèmes
  - Autonomie
  - Adaptabilité
  - Rigueur et qualité du travail
- Interface avec cases à cocher
- Design coloré avec feedback visuel (checkmark ✓)

**Note sur 20** 📊
- Champ numérique avec validation (0 à 20)
- Support des décimales (ex: 15.5)
- Interface intuitive avec affichage "/ 20"

**Commentaire d'évaluation** 💬
- Zone de texte multiligne
- Obligatoire
- Permet de donner un retour détaillé à l'étudiant

#### Actions
- **Réinitialiser** : Efface tous les champs
- **Enregistrer l'évaluation** : Sauvegarde l'évaluation (avec animation de chargement)

#### Messages de retour
- ✓ Succès : Confirmation de l'enregistrement
- ⚠ Erreur : Affichage des erreurs de validation

## 🎨 Design

- Interface moderne avec dégradés colorés
- Sections bien distinctes par couleur :
  - 🟣 Violet/Rose pour les compétences
  - 🔵 Bleu pour la note
  - 🟡 Jaune/Orange pour le commentaire
- Animation et transitions fluides
- Responsive design

## 🚀 Accès

**URL** : `/dashboard/tuteur`

Le dashboard est accessible via la route configurée dans `App.jsx`.

## 🔧 Améliorations futures

### Phase 2 - Dépôt de documents
- Accès aux documents déposés par l'étudiant
- Téléchargement des documents
- Notation des documents

### Intégrations à venir
- Connexion avec l'API backend pour :
  - Récupérer la liste réelle des étudiants
  - Sauvegarder les évaluations dans la base de données
  - Récupérer les évaluations existantes
- Liaison avec le journal de formation de l'étudiant
- Historique des évaluations
- Export des évaluations en PDF

## 📁 Fichiers créés/modifiés

### Créés
- `sigl_frontend/src/pages/dashboard/TutorDashboard.jsx` - Composant principal du dashboard tuteur

### Modifiés
- `sigl_frontend/src/App.jsx` - Ajout de la route `/dashboard/tuteur`

## 💡 Utilisation

1. Se connecter en tant que tuteur
2. Accéder à `/dashboard/tuteur`
3. Naviguer entre les onglets :
   - **Profil** : Voir/modifier ses informations
   - **Calendrier** : Consulter les événements
   - **Évaluation** : Évaluer un étudiant

### Pour évaluer un étudiant :
1. Sélectionner l'étudiant dans la liste déroulante
2. Cocher les compétences validées
3. Saisir une note sur 20
4. Rédiger un commentaire
5. Cliquer sur "Enregistrer l'évaluation"

## 🔐 Prochaines étapes

1. Créer l'API backend pour les évaluations
2. Connecter le formulaire à l'API
3. Ajouter la récupération dynamique des étudiants
4. Implémenter le module de dépôt/téléchargement de documents
5. Ajouter la fonctionnalité de notation des documents

---

**Version** : 1.0  
**Date** : Janvier 2026  
**Statut** : ✅ Première phase complète
