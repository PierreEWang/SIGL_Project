const Evaluation = require('./evaluation.model');

class EvaluationRepository {
  /**
   * Crée une nouvelle évaluation
   */
  async create(evaluationData) {
    const evaluation = new Evaluation(evaluationData);
    return await evaluation.save();
  }

  /**
   * Trouve une évaluation par ID
   */
  async findById(id) {
    return await Evaluation.findById(id)
      .populate('entretien')
      .populate('evaluateur', 'nom prenom email')
      .populate('validePar', 'nom prenom email');
  }

  /**
   * Trouve les évaluations par entretien
   */
  async findByEntretien(entretienId) {
    return await Evaluation.findOne({ entretien: entretienId })
      .populate('entretien')
      .populate('evaluateur', 'nom prenom email')
      .populate('validePar', 'nom prenom email');
  }

  /**
   * Trouve les évaluations créées par un évaluateur
   */
  async findByEvaluateur(evaluateurId, options = {}) {
    const query = { evaluateur: evaluateurId };
    let queryBuilder = Evaluation.find(query)
      .populate('entretien')
      .populate('evaluateur', 'nom prenom email')
      .populate('validePar', 'nom prenom email');

    // Filtrage par état
    if (options.etat) {
      queryBuilder = queryBuilder.where('etat').equals(options.etat);
    }

    // Tri
    if (options.sort) {
      queryBuilder = queryBuilder.sort(options.sort);
    } else {
      queryBuilder = queryBuilder.sort({ dateEvaluation: -1 });
    }

    // Pagination
    if (options.skip && options.limit) {
      queryBuilder = queryBuilder.skip(options.skip).limit(options.limit);
    }

    return await queryBuilder.exec();
  }

  /**
   * Trouve les évaluations pour un entretien spécifique (toutes les évaluations de cet entretien)
   */
  async findAllForEntretien(entretienId) {
    return await Evaluation.find({ entretien: entretienId })
      .populate('entretien')
      .populate('evaluateur', 'nom prenom email')
      .populate('validePar', 'nom prenom email')
      .sort({ dateEvaluation: -1 });
  }

  /**
   * Met à jour une évaluation
   */
  async update(id, updateData) {
    return await Evaluation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('entretien')
      .populate('evaluateur', 'nom prenom email')
      .populate('validePar', 'nom prenom email');
  }

  /**
   * Change l'état d'une évaluation
   */
  async updateEtat(id, nouvelEtat, validePar = null) {
    const updateData = {
      etat: nouvelEtat
    };

    if (validePar) {
      updateData.validePar = validePar;
      updateData.dateValidation = new Date();
    }

    return await this.update(id, updateData);
  }

  /**
   * Supprime une évaluation
   */
  async delete(id) {
    return await Evaluation.findByIdAndDelete(id);
  }

  /**
   * Compte les évaluations par état pour un évaluateur
   */
  async countByEtatForEvaluateur(evaluateurId) {
    return await Evaluation.aggregate([
      { $match: { evaluateur: evaluateurId } },
      { $group: { _id: '$etat', count: { $sum: 1 } } }
    ]);
  }

  /**
   * Calcule les statistiques moyennes pour un entretien
   */
  async getStatistiquesEntretien(entretienId) {
    const result = await Evaluation.aggregate([
      { $match: { entretien: entretienId } },
      {
        $group: {
          _id: null,
          moyenneDiagnostiquer: { $avg: '$diagnostiquer' },
          moyenneProduire: { $avg: '$produire' },
          moyenneValider: { $avg: '$valider' },
          moyenneAdapter: { $avg: '$adapter' },
          moyenneCommuniquer: { $avg: '$communiquer' },
          scoreGlobalMoyen: { $avg: '$scoreGlobal' },
          nombreEvaluations: { $sum: 1 }
        }
      }
    ]);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Cherche les évaluations avec filtres avancés
   */
  async findWithFilters(filters = {}) {
    let query = {};

    if (filters.evaluateur) {
      query.evaluateur = filters.evaluateur;
    }
    if (filters.etat) {
      query.etat = filters.etat;
    }
    if (filters.entretien) {
      query.entretien = filters.entretien;
    }

    let queryBuilder = Evaluation.find(query)
      .populate('entretien')
      .populate('evaluateur', 'nom prenom email')
      .populate('validePar', 'nom prenom email');

    if (filters.sort) {
      queryBuilder = queryBuilder.sort(filters.sort);
    } else {
      queryBuilder = queryBuilder.sort({ dateEvaluation: -1 });
    }

    return await queryBuilder.exec();
  }
}

module.exports = new EvaluationRepository();
