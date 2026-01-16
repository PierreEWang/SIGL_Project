const evaluationRepository = require('./evaluation.repository');
const Entretien = require('../entretien/entretien.model');

class EvaluationService {
  /**
   * Crée une évaluation pour un apprenti
   */
  async createEvaluationForApprentice(apprenticeId, evaluateurId, evaluationData) {
    // Créer l'évaluation
    const evaluation = await evaluationRepository.create({
      apprenti: apprenticeId,
      evaluateur: evaluateurId,
      entretien: evaluationData.entretienId || null,
      dateEvaluation: evaluationData.evaluationDate || new Date(),
      competences: evaluationData.competences || [],
      moyenneGenerale: evaluationData.moyenneGenerale || 0,
      pointsForts: evaluationData.pointsForts || '',
      axesAmelioration: evaluationData.axesAmelioration || '',
      etat: 'SOUMISE',
      historique: [{
        date: new Date(),
        action: 'CREATION',
        auteur: evaluateurId
      }]
    });

    return evaluation;
  }

  /**
   * Crée une nouvelle évaluation pour un entretien
   */
  async creerEvaluation(entretienId, evaluateurId, evaluationData) {
    // Vérifier que l'entretien existe et est confirmé
    const entretien = await Entretien.findById(entretienId);
    if (!entretien) {
      throw new Error('Entretien non trouvé');
    }

    if (entretien.statut !== 'CONFIRME' && entretien.statut !== 'TERMINE') {
      throw new Error('Impossible d\'évaluer un entretien qui n\'est pas confirmé');
    }

    // Vérifier qu'une évaluation n'existe pas déjà pour cet entretien par cet évaluateur
    const existante = await evaluationRepository.findByEntretien(entretienId);
    if (existante && existante.evaluateur.toString() === evaluateurId) {
      throw new Error('Une évaluation existe déjà pour cet entretien par cet évaluateur');
    }

    // Valider les données
    this._validerDonneesEvaluation(evaluationData);

    // Créer l'évaluation
    const evaluation = await evaluationRepository.create({
      entretien: entretienId,
      evaluateur: evaluateurId,
      competences: evaluationData.competences,
      communication: evaluationData.communication,
      motivation: evaluationData.motivation,
      ponctualite: evaluationData.ponctualite,
      autonomie: evaluationData.autonomie,
      pointsForts: evaluationData.pointsForts,
      axesAmelioration: evaluationData.axesAmelioration,
      commentairesGeneral: evaluationData.commentairesGeneral,
      recommandation: evaluationData.recommandation,
      etat: 'BROUILLON'
    });

    return evaluation;
  }

  /**
   * Soumet une évaluation (passe de BROUILLON à SOUMISE)
   */
  async soumettreEvaluation(evaluationId, evaluateurId) {
    const evaluation = await evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    if (evaluation.evaluateur._id.toString() !== evaluateurId) {
      throw new Error('Seul l\'évaluateur peut soumettre une évaluation');
    }

    if (evaluation.etat !== 'BROUILLON') {
      throw new Error('Seule une évaluation en brouillon peut être soumise');
    }

    return await evaluationRepository.updateEtat(evaluationId, 'SOUMISE');
  }

  /**
   * Approuve une évaluation (passe à APPROUVEE)
   */
  async approuverEvaluation(evaluationId, approuvateurId) {
    const evaluation = await evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    if (evaluation.etat !== 'SOUMISE') {
      throw new Error('Seule une évaluation soumise peut être approuvée');
    }

    return await evaluationRepository.updateEtat(
      evaluationId,
      'APPROUVEE',
      approuvateurId
    );
  }

  /**
   * Rejette une évaluation
   */
  async rejeterEvaluation(evaluationId, rejetPar) {
    const evaluation = await evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    if (evaluation.etat === 'REJETEE') {
      throw new Error('Évaluation déjà rejetée');
    }

    return await evaluationRepository.updateEtat(
      evaluationId,
      'REJETEE',
      rejetPar
    );
  }

  /**
   * Récupère l'évaluation d'un entretien
   */
  async obtenirEvaluation(evaluationId) {
    const evaluation = await evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }
    return evaluation;
  }

  /**
   * Récupère les évaluations d'un évaluateur
   */
  async obtenirEvaluationsEvaluateur(evaluateurId, options = {}) {
    return await evaluationRepository.findByEvaluateur(evaluateurId, options);
  }

  /**
   * Récupère les statistiques d'un entretien
   */
  async obtenirStatistiquesEntretien(entretienId) {
    const stats = await evaluationRepository.getStatistiquesEntretien(entretienId);
    if (!stats) {
      throw new Error('Aucune évaluation trouvée pour cet entretien');
    }
    return stats;
  }

  /**
   * Met à jour une évaluation en brouillon
   */
  async mettreAJourEvaluation(evaluationId, evaluateurId, updateData) {
    const evaluation = await evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    if (evaluation.evaluateur._id.toString() !== evaluateurId) {
      throw new Error('Seul l\'évaluateur peut modifier une évaluation');
    }

    if (evaluation.etat !== 'BROUILLON') {
      throw new Error('Seule une évaluation en brouillon peut être modifiée');
    }

    // Valider les données mises à jour
    const dataToUpdate = {};
    const fieldsAutorisees = [
      'competences', 'communication', 'motivation', 'ponctualite', 'autonomie',
      'pointsForts', 'axesAmelioration', 'commentairesGeneral', 'recommandation'
    ];

    for (const field of fieldsAutorisees) {
      if (field in updateData) {
        dataToUpdate[field] = updateData[field];
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new Error('Aucune donnée valide à mettre à jour');
    }

    this._validerDonneesEvaluation(dataToUpdate, false);
    return await evaluationRepository.update(evaluationId, dataToUpdate);
  }

  /**
   * Supprime une évaluation en brouillon
   */
  async supprimerEvaluation(evaluationId, evaluateurId) {
    const evaluation = await evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new Error('Évaluation non trouvée');
    }

    if (evaluation.evaluateur._id.toString() !== evaluateurId) {
      throw new Error('Seul l\'évaluateur peut supprimer une évaluation');
    }

    if (evaluation.etat !== 'BROUILLON') {
      throw new Error('Seule une évaluation en brouillon peut être supprimée');
    }

    return await evaluationRepository.delete(evaluationId);
  }

  /**
   * Valide les données d'évaluation
   */
  _validerDonneesEvaluation(data, validate_all = true) {
    const requiredFields = [
      'competences', 'communication', 'motivation', 'ponctualite', 'autonomie'
    ];

    if (validate_all) {
      // Validation complète pour création
      const missingFields = requiredFields.filter(field => !(field in data));
      if (missingFields.length > 0) {
        throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
      }

      if (!data.recommandation) {
        throw new Error('Recommandation requise');
      }

      if (!['VALIDER', 'REDISCUTER', 'REJETER'].includes(data.recommandation)) {
        throw new Error('Recommandation invalide');
      }
    }

    // Validation des scores
    for (const field of requiredFields) {
      if (field in data) {
        const value = data[field];
        if (typeof value !== 'number' || value < 0 || value > 5) {
          throw new Error(`${field} doit être entre 0 et 5`);
        }
      }
    }

    // Validation de la recommandation si fournie
    if (data.recommandation && !['VALIDER', 'REDISCUTER', 'REJETER'].includes(data.recommandation)) {
      throw new Error('Recommandation invalide');
    }
  }

  /**
   * Obtient le résumé des évaluations pour un entretien
   */
  async obtenirResumeEvaluations(entretienId) {
    const evaluations = await evaluationRepository.findAllForEntretien(entretienId);
    
    if (evaluations.length === 0) {
      return {
        nombreEvaluations: 0,
        etat: 'AUCUNE_EVALUATION',
        evaluations: []
      };
    }

    const stats = await this.obtenirStatistiquesEntretien(entretienId);

    return {
      nombreEvaluations: evaluations.length,
      statistiques: stats,
      evaluations: evaluations.map(e => ({
        id: e._id,
        evaluateur: e.evaluateur.nom + ' ' + e.evaluateur.prenom,
        scoreGlobal: e.scoreGlobal,
        recommandation: e.recommandation,
        etat: e.etat
      }))
    };
  }
}

module.exports = new EvaluationService();
