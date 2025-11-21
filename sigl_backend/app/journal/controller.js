const journalService = require('./service');

/**
 * POST /api/journaux
 * Crée un journal mensuel pour l'apprenti connecté
 */
const createJournal = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const journal = await journalService.createJournalForUser(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Journal créé avec succès',
      data: journal,
    });
  } catch (error) {
    console.error('createJournal error:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erreur lors de la création du journal',
    });
  }
};

/**
 * GET /api/journaux
 * Récupère tous les journaux de l'apprenti connecté
 */
const getMyJournaux = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const journaux = await journalService.getJournauxForUser(userId);

    return res.status(200).json({
      success: true,
      data: journaux,
    });
  } catch (error) {
    console.error('getMyJournaux error:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Erreur lors de la récupération des journaux',
    });
  }
};

module.exports = {
  createJournal,
  getMyJournaux,
};