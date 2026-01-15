const entretienService = require('./entretien.service');

class EntretienController {
  /**
   * Crée une demande d'entretien
   */
  async creerEntretien(req, res) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Utilisateur non authentifié'
        });
      }

      const { objet, debut, fin, participants } = req.body;

      if (!objet || !debut || !fin || !participants) {
        return res.status(400).json({
          success: false,
          error: 'Champs requis: objet, debut, fin, participants'
        });
      }

      const entretien = await entretienService.demanderEntretien(
        userId,
        objet,
        debut,
        fin,
        participants
      );

      return res.status(201).json({
        success: true,
        message: 'Entretien créé avec succès',
        data: entretien
      });
    } catch (error) {
      console.error('Erreur création entretien:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Récupère les entretiens de l'utilisateur
   */
  async getMesEntretiens(req, res) {
    try {
      const userId = req.user.userId;
      const entretiens = await entretienService.getEntretiensUtilisateur(userId);

      return res.json({
        success: true,
        data: entretiens
      });
    } catch (error) {
      console.error('Erreur récupération entretiens:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Récupère un entretien spécifique
   */
  async getEntretien(req, res) {
    try {
      const { entretienId } = req.params;
      const entretien = await entretienService.getEntretien(entretienId);

      return res.json({
        success: true,
        data: entretien
      });
    } catch (error) {
      console.error('Erreur récupération entretien:', error);
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Confirme une demande d'entretien
   */
  async confirmerEntretien(req, res) {
    try {
      const { entretienId } = req.params;
      const userId = req.user.userId;

      const entretien = await entretienService.confirmerEntretien(entretienId, userId);

      return res.json({
        success: true,
        message: 'Entretien confirmé',
        data: entretien
      });
    } catch (error) {
      console.error('Erreur confirmation:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Annule un entretien
   */
  async annulerEntretien(req, res) {
    try {
      const { entretienId } = req.params;
      const userId = req.user.userId;

      const entretien = await entretienService.annulerEntretien(entretienId, userId);

      return res.json({
        success: true,
        message: 'Entretien annulé',
        data: entretien
      });
    } catch (error) {
      console.error('Erreur annulation:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Récupère les entretiens pour le calendrier
   */
  async getEntretiensCalendar(req, res) {
    try {
      const userId = req.user.userId;
      const entretiens = await entretienService.getEntretiensForCalendar(userId);

      return res.json({
        success: true,
        data: entretiens
      });
    } catch (error) {
      console.error('Erreur calendrier:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new EntretienController();