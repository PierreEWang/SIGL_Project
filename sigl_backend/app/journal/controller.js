// sigl_backend/app/journal/controller.js
const journalService = require('./service');

/**
 * POST /api/journaux
 */
const createJournal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const journal = await journalService.createJournalForUser(userId,req.body,req.headers.authorization);

    return res.status(201).json({
      success: true,
      message: 'Journal créé avec succès',
      data: journal,
    });
  } catch (error) {
    console.error('createJournal error:', error);

    const status = error.status || error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
      message: error.message || "Erreur lors de la création du journal",
    });
  }
};

/**
 * GET /api/journaux
 */
const getMyJournaux = async (req, res) => {
  try {
    const userId = req.user.userId;
    const journaux = await journalService.getJournauxForUser(userId);

    return res.status(200).json({
      success: true,
      data: journaux,
    });
  } catch (error) {
    console.error('getMyJournaux error:', error);

    const status = error.status || error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
      message: error.message || 'Erreur lors de la récupération des journaux',
    });
  }
};

/**
 * GET /api/journaux/:id
 */
const getJournalById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const journal = await journalService.getJournalForUser(userId, id);

    return res.status(200).json({
      success: true,
      data: journal,
    });
  } catch (error) {
    console.error('getJournalById error:', error);

    const status = error.status || error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
      message: error.message || 'Erreur lors de la récupération du journal',
    });
  }
};

/**
 * PUT /api/journaux/:id
 */
const updateJournal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const journal = await journalService.updateJournalForUser(userId, id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Journal mis à jour avec succès',
      data: journal,
    });
  } catch (error) {
    console.error('updateJournal error:', error);

    const status = error.status || error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
      message: error.message || "Erreur lors de la mise à jour du journal",
    });
  }
};

/**
 * DELETE /api/journaux/:id
 */
const deleteJournal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    await journalService.deleteJournalForUser(userId, id);

    return res.status(200).json({
      success: true,
      message: 'Journal supprimé avec succès',
    });
  } catch (error) {
    console.error('deleteJournal error:', error);

    const status = error.status || error.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST',
      message: error.message || 'Erreur lors de la suppression du journal',
    });
  }
};

module.exports = {
  createJournal,
  getMyJournaux,
  getJournalById,
  updateJournal,
  deleteJournal,
};