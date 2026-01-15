const Entretien = require('./entretien.model');
const Creneau = require('../creneau/creneau.model');

class EntretienRepository {
  /**
   * Crée un nouvel entretien avec son créneau
   */
  async createWithCreneau(entretienData, creneauData) {
    // Créer le créneau d'abord
    const creneau = new Creneau(creneauData);
    await creneau.save();

    // Créer l'entretien avec la référence au créneau
    const entretien = new Entretien({
      ...entretienData,
      creneau: creneau._id
    });
    await entretien.save();

    // Retourner l'entretien avec les données populées
    return await this.findById(entretien._id);
  }

  /**
   * Trouve un entretien par ID
   */
  async findById(id) {
    return await Entretien.findById(id)
      .populate('creneau')
      .populate('participants', 'nom prenom email role')
      .populate('creePar', 'nom prenom email role')
      .populate('confirmations.participant', 'nom prenom email role');
  }

  /**
   * Trouve les entretiens d'un participant
   */
  async findByParticipant(userId) {
    return await Entretien.find({ participants: userId })
      .populate('creneau')
      .populate('participants', 'nom prenom email role')
      .populate('creePar', 'nom prenom email role')
      .populate('confirmations.participant', 'nom prenom email role')
      .sort({ 'creneau.debut': -1 });
  }

  /**
   * Trouve les entretiens créés par un utilisateur
   */
  async findByCreePar(userId) {
    return await Entretien.find({ creePar: userId })
      .populate('creneau')
      .populate('participants', 'nom prenom email role')
      .populate('creePar', 'nom prenom email role')
      .populate('confirmations.participant', 'nom prenom email role')
      .sort({ 'creneau.debut': -1 });
  }

  /**
   * Met à jour le statut d'un entretien
   */
  async updateStatut(id, newStatus, confirmations = null) {
    const updateData = { statut: newStatus };
    if (confirmations) {
      updateData.confirmations = confirmations;
    }

    return await Entretien.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('creneau')
      .populate('participants', 'nom prenom email role')
      .populate('creePar', 'nom prenom email role')
      .populate('confirmations.participant', 'nom prenom email role');
  }

  /**
   * Récupère les entretiens pour affichage calendrier
   */
  async findForCalendar(userId) {
    return await Entretien.find({
      participants: userId,
      statut: { $ne: 'ANNULE' }
    })
      .populate('creneau')
      .select('objet statut creneau');
  }

  /**
   * Supprime un entretien
   */
  async delete(id) {
    return await Entretien.findByIdAndDelete(id);
  }

  /**
   * Compte les entretiens par statut
   */
  async countByStatus() {
    return await Entretien.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 }
        }
      }
    ]);
  }
}

module.exports = new EntretienRepository();
