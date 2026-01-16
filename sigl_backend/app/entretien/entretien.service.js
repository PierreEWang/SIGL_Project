const entretienRepository = require('./entretien.repository');
const userRepository = require('../user/repository');
const CalendarEvent = require('../calendar/calendar.model');
const Utilisateur = require('../common/models/user.model');

class EntretienService {
  /**
   * Crée une demande d'entretien
   * @param userId - ID de l'utilisateur créateur
   * @param objet - Objet de l'entretien
   * @param debut - Date/heure de début
   * @param fin - Date/heure de fin
   * @param participants - Array d'emails ou d'IDs des participants
   */
  async demanderEntretien(userId, objet, debut, fin, participants) {
    // Validation robuste
    if (!userId) {
      throw new Error('UserId est requis');
    }

    if (!objet || !debut || !fin || !participants) {
      throw new Error('Données invalides pour créer un entretien');
    }

    if (new Date(fin) <= new Date(debut)) {
      throw new Error('La date de fin doit être après la date de début');
    }

    // Convertir les emails en IDs
    let participantIds = [];
    
    for (const participant of participants) {
      if (!participant) {
        continue; // Ignorer les valeurs vides
      }

      let participantId = null;
      
      // Si c'est un email (contient @), chercher l'utilisateur
      if (typeof participant === 'string' && participant.includes('@')) {
        const user = await userRepository.findUserByEmail(participant);
        if (!user) {
          throw new Error(`Utilisateur avec email ${participant} non trouvé`);
        }
        participantId = user._id;
      } else if (typeof participant === 'string') {
        // C'est probablement un ID, vérifier qu'il est valide
        participantId = participant;
      } else {
        // C'est déjà un ObjectID Mongoose
        participantId = participant;
      }

      if (participantId) {
        participantIds.push(participantId);
      }
    }

    // S'assurer que le créateur est dans la liste des participants
    const userIdStr = userId.toString();
    const isDuplicateCreator = participantIds.some(p => {
      if (!p) return false;
      const pStr = p.toString();
      return pStr === userIdStr;
    });
    
    if (!isDuplicateCreator) {
      participantIds.push(userId);
    }

    // Vérifier au moins 2 participants
    if (participantIds.length < 2) {
      throw new Error('Au moins 2 participants sont requis');
    }

    // Si le créateur est APPRENTI, il ne peut pas inviter d'autres APPRENTIS
    const participantsDocs = await Utilisateur.find({ _id: { $in: participantIds } }, 'role').lean();
    const creator = await Utilisateur.findById(userId).lean();
    if (creator?.role === 'APPRENTI') {
      const hasOtherApprentis = participantsDocs.some(p => p.role === 'APPRENTI' && p._id.toString() !== userId.toString());
      if (hasOtherApprentis) {
        throw new Error('Un apprenti ne peut pas inviter d\'autres apprentis à un entretien');
      }
    }

    // Créer le tableau de confirmations (tous initialisés à false sauf le créateur)
    const confirmations = participantIds.map(pId => ({
      participant: pId,
      confirme: pId.toString() === userIdStr,
      dateConfirmation: pId.toString() === userIdStr ? new Date() : null
    }));

    const entretienData = {
      objet,
      participants: participantIds,
      confirmations,
      creePar: userId,
      statut: 'DEMANDE'
    };

    const creneauData = {
      debut: new Date(debut),
      fin: new Date(fin),
      disponibilite: 'RESERVE'
    };

    // Créer l'entretien
    const entretien = await entretienRepository.createWithCreneau(entretienData, creneauData);

    // Créer un événement calendrier pour chaque participant
    try {
      const debutDate = new Date(debut);
      const dateStr = debutDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = debutDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

      for (const participantId of participantIds) {
        await CalendarEvent.create({
          title: `Entretien - ${objet}`,
          description: `Entretien avec ${participantIds.length} participants`,
          date: dateStr,
          time: timeStr,
          category: 'réunion',
          userId: participantId,
          entretienId: entretien._id
        });
      }
    } catch (error) {
      console.error('Erreur création événements calendrier:', error);
      // Ne pas laisser cette erreur bloquer la création de l'entretien
    }

    return entretien;
  }

  /**
   * Confirme une demande d'entretien
   */
  async confirmerEntretien(entretienId, utilisateurId) {
    const entretien = await entretienRepository.findById(entretienId);
    
    if (!entretien) {
      throw new Error('Entretien non trouvé');
    }

    if (entretien.statut !== 'DEMANDE') {
      throw new Error('Seule une demande peut être confirmée');
    }

    // Vérifier que l'utilisateur est participant
    const isParticipant = entretien.participants.some(p => p._id.toString() === utilisateurId.toString());
    if (!isParticipant) {
      throw new Error('Vous n\'êtes pas participant à cet entretien');
    }

    // Marquer ce participant comme confirmé
    const userIdStr = utilisateurId.toString();
    const confirmationIndex = entretien.confirmations.findIndex(
      c => c.participant._id.toString() === userIdStr
    );

    if (confirmationIndex >= 0) {
      entretien.confirmations[confirmationIndex].confirme = true;
      entretien.confirmations[confirmationIndex].dateConfirmation = new Date();
    }

    // Vérifier si TOUS les participants ont confirmé
    const tousConfirmes = entretien.confirmations.every(c => c.confirme);
    
    if (tousConfirmes) {
      entretien.statut = 'CONFIRME';
    }

    return await entretienRepository.updateStatut(entretienId, tousConfirmes ? 'CONFIRME' : 'DEMANDE', entretien.confirmations);
  }

  /**
   * Annule un entretien
   */
  async annulerEntretien(entretienId, utilisateurId) {
    const entretien = await entretienRepository.findById(entretienId);
    
    if (!entretien) {
      throw new Error('Entretien non trouvé');
    }

    if (entretien.statut === 'ANNULE') {
      throw new Error('Entretien déjà annulé');
    }

    // Vérifier que l'utilisateur est participant
    const isParticipant = entretien.participants.some(p => p._id.toString() === utilisateurId.toString());
    if (!isParticipant) {
      throw new Error('Vous n\'êtes pas participant à cet entretien');
    }

    // Supprimer les événements calendrier liés
    try {
      await CalendarEvent.deleteMany({ entretienId });
    } catch (error) {
      console.error('Erreur suppression événements calendrier:', error);
    }

    return await entretienRepository.updateStatut(entretienId, 'ANNULE');
  }

  /**
   * Récupère les entretiens de l'utilisateur
   */
  async getEntretiensUtilisateur(userId) {
    return await entretienRepository.findByParticipant(userId);
  }

  /**
   * Récupère un entretien spécifique
   */
  async getEntretien(entretienId) {
    const entretien = await entretienRepository.findById(entretienId);
    if (!entretien) {
      throw new Error('Entretien non trouvé');
    }
    return entretien;
  }

  /**
   * Récupère les entretiens pour le calendrier
   */
  async getEntretiensForCalendar(userId) {
    return await entretienRepository.findForCalendar(userId);
  }

  /**
   * Marque un entretien comme terminé
   */
  async terminerEntretien(entretienId) {
    return await entretienRepository.updateStatut(entretienId, 'TERMINE');
  }

  /**
   * Met à jour un entretien avec historisation
   */
  async mettreAJourEntretien(entretienId, updates, userId, notes = '') {
    const entretien = await entretienRepository.findById(entretienId);
    if (!entretien) {
      throw new Error('Entretien non trouvé');
    }

    // Enregistrer les modifications dans l'historique
    const historique = [];
    for (const [champ, nouvelleValeur] of Object.entries(updates)) {
      if (champ !== 'historique' && entretien[champ] !== nouvelleValeur) {
        historique.push({
          date: new Date(),
          auteur: userId,
          champ,
          ancienneValeur: entretien[champ],
          nouvelleValeur,
          notes
        });
      }
    }

    // Mettre à jour l'entretien
    Object.assign(entretien, updates);
    if (historique.length > 0) {
      entretien.historique = [...(entretien.historique || []), ...historique];
    }

    return await entretien.save();
  }
}

module.exports = new EntretienService();
