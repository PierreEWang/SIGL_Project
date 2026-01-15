const evaluationService = require('./evaluation.service');

class EvaluationController {
  /**
   * Crée une nouvelle évaluation
   */
  async creerEvaluation(req, res) {
    try {
      const { entretienId } = req.params;
      const evaluateurId = req.user.userId;
      const {
        diagnostiquer,
        produire,
        valider,
        adapter,
        communiquer,
        pointsForts,
        axesAmelioration,
        commentairesGeneral,
        recommandation
      } = req.body;

      // Validation basique
      if (![diagnostiquer, produire, valider, adapter, communiquer].every(
        s => typeof s === 'number' && s >= 0 && s <= 5
      )) {
        return res.status(400).json({
          success: false,
          error: 'Les scores doivent être entre 0 et 5',
          message: 'Validation échouée'
        });
      }

      if (!['VALIDER', 'REDISCUTER', 'REJETER'].includes(recommandation)) {
        return res.status(400).json({
          success: false,
          error: 'Recommandation invalide',
          message: 'Validation échouée'
        });
      }

      const evaluation = await evaluationService.creerEvaluation(
        entretienId,
        evaluateurId,
        {
          competences,
          communication,
          motivation,
          ponctualite,
          autonomie,
          pointsForts,
          axesAmelioration,
          commentairesGeneral,
          recommandation
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Évaluation créée avec succès',
        data: evaluation
      });
    } catch (error) {
      console.error('Erreur création évaluation:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la création de l\'évaluation'
      });
    }
  }

  /**
   * Soumet une évaluation
   */
  async soumettreEvaluation(req, res) {
    try {
      const { evaluationId } = req.params;
      const evaluateurId = req.user.userId;

      const evaluation = await evaluationService.soumettreEvaluation(
        evaluationId,
        evaluateurId
      );

      return res.json({
        success: true,
        message: 'Évaluation soumise avec succès',
        data: evaluation
      });
    } catch (error) {
      console.error('Erreur soumission évaluation:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la soumission de l\'évaluation'
      });
    }
  }

  /**
   * Approuve une évaluation
   */
  async approuverEvaluation(req, res) {
    try {
      const { evaluationId } = req.params;
      const approuvateurId = req.user.userId;

      const evaluation = await evaluationService.approuverEvaluation(
        evaluationId,
        approuvateurId
      );

      return res.json({
        success: true,
        message: 'Évaluation approuvée avec succès',
        data: evaluation
      });
    } catch (error) {
      console.error('Erreur approbation évaluation:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de l\'approbation de l\'évaluation'
      });
    }
  }

  /**
   * Rejette une évaluation
   */
  async rejeterEvaluation(req, res) {
    try {
      const { evaluationId } = req.params;
      const rejetPar = req.user.userId;

      const evaluation = await evaluationService.rejeterEvaluation(
        evaluationId,
        rejetPar
      );

      return res.json({
        success: true,
        message: 'Évaluation rejetée',
        data: evaluation
      });
    } catch (error) {
      console.error('Erreur rejet évaluation:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Erreur lors du rejet de l\'évaluation'
      });
    }
  }

  /**
   * Récupère une évaluation
   */
  async obtenirEvaluation(req, res) {
    try {
      const { evaluationId } = req.params;

      const evaluation = await evaluationService.obtenirEvaluation(evaluationId);

      return res.json({
        success: true,
        data: evaluation
      });
    } catch (error) {
      console.error('Erreur récupération évaluation:', error);
      return res.status(404).json({
        success: false,
        error: error.message,
        message: 'Évaluation non trouvée'
      });
    }
  }

  /**
   * Récupère les évaluations de l'utilisateur
   */
  async obtenirMesEvaluations(req, res) {
    try {
      const evaluateurId = req.user.userId;
      const { etat, sort } = req.query;

      const options = {
        sort: sort ? JSON.parse(sort) : { dateEvaluation: -1 }
      };

      if (etat) {
        options.etat = etat;
      }

      const evaluations = await evaluationService.obtenirEvaluationsEvaluateur(
        evaluateurId,
        options
      );

      return res.json({
        success: true,
        data: evaluations
      });
    } catch (error) {
      console.error('Erreur récupération évaluations:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération des évaluations'
      });
    }
  }

  /**
   * Récupère les statistiques d'un entretien
   */
  async obtenirStatistiques(req, res) {
    try {
      const { entretienId } = req.params;

      const stats = await evaluationService.obtenirStatistiquesEntretien(entretienId);

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur statistiques:', error);
      return res.status(404).json({
        success: false,
        error: error.message,
        message: 'Aucune statistique disponible'
      });
    }
  }

  /**
   * Met à jour une évaluation
   */
  async mettreAJourEvaluation(req, res) {
    try {
      const { evaluationId } = req.params;
      const evaluateurId = req.user.userId;

      const evaluation = await evaluationService.mettreAJourEvaluation(
        evaluationId,
        evaluateurId,
        req.body
      );

      return res.json({
        success: true,
        message: 'Évaluation mise à jour',
        data: evaluation
      });
    } catch (error) {
      console.error('Erreur mise à jour évaluation:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la mise à jour'
      });
    }
  }

  /**
   * Supprime une évaluation
   */
  async supprimerEvaluation(req, res) {
    try {
      const { evaluationId } = req.params;
      const evaluateurId = req.user.userId;

      await evaluationService.supprimerEvaluation(evaluationId, evaluateurId);

      return res.json({
        success: true,
        message: 'Évaluation supprimée'
      });
    } catch (error) {
      console.error('Erreur suppression évaluation:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la suppression'
      });
    }
  }

  /**
   * Récupère le résumé des évaluations d'un entretien
   */
  async obtenirResumeEvaluations(req, res) {
    try {
      const { entretienId } = req.params;

      const resume = await evaluationService.obtenirResumeEvaluations(entretienId);

      return res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      console.error('Erreur résumé évaluations:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'Erreur lors de la récupération du résumé'
      });
    }
  }
}

module.exports = new EvaluationController();
