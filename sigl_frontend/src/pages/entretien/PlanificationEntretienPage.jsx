import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import entretienPlanificationService from '../../services/entretienPlanificationService';

const PlanificationEntretienPage = () => {
  const { entretienId } = useParams();
  const [entretien, setEntretien] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [formData, setFormData] = useState({
    diagnostiquer: 3,
    produire: 3,
    valider: 3,
    adapter: 3,
    communiquer: 3,
    pointsForts: '',
    axesAmelioration: '',
    commentairesGeneral: '',
    recommandation: 'VALIDER'
  });
  const [stats, setStats] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [entretienId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger l'entretien
      const entretienData = await entretienPlanificationService.getEntretienDetail(entretienId);
      setEntretien(entretienData);

      // Essayer de charger l'évaluation existante
      try {
        const resume = await entretienPlanificationService.obtenirResumeEvaluations(entretienId);
        if (resume.nombreEvaluations > 0) {
          setEvaluation(resume.evaluations[0]);
          setStats(resume.statistiques);
        }
      } catch (err) {
        // Pas d'évaluation, c'est normal
        console.log('Aucune évaluation trouvée');
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Impossible de charger les détails');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Score') || name.includes('diagnostiquer') || 
              name.includes('produire') || name.includes('valider') ||
              name.includes('adapter') || name.includes('communiquer')
        ? parseInt(value) : value
    }));
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      
      const newEvaluation = await entretienPlanificationService.creerEvaluation(
        entretienId,
        formData
      );

      // Soumettre automatiquement l'évaluation
      const submitted = await entretienPlanificationService.soumettreEvaluation(
        newEvaluation._id
      );

      setEvaluation(submitted);
      setShowEvaluationForm(false);
      
      // Recharger les stats
      const resume = await entretienPlanificationService.obtenirResumeEvaluations(entretienId);
      if (resume.nombreEvaluations > 0) {
        setStats(resume.statistiques);
      }

      alert('Évaluation créée et soumise avec succès !');
    } catch (err) {
      console.error('Erreur soumission:', err);
      setError(err.response?.data?.error || 'Erreur lors de la soumission');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!entretien) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-gray-500">Entretien non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Planification & Évaluation d'Entretien
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Objet</h3>
              <p className="text-lg text-gray-900">{entretien.objet}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Statut</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                entretien.statut === 'CONFIRME' ? 'bg-green-100 text-green-800' :
                entretien.statut === 'DEMANDE' ? 'bg-yellow-100 text-yellow-800' :
                entretien.statut === 'ANNULE' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {entretien.statut}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Date & Heure</h3>
              <p className="text-gray-900">
                {entretien.creneau?.debut ? new Date(entretien.creneau.debut).toLocaleString('fr-FR') : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Participants</h3>
              <p className="text-gray-900">{entretien.participants?.length || 0} participants</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formulaire d'évaluation */}
            {!evaluation && entretien.statut === 'CONFIRME' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <button
                  onClick={() => setShowEvaluationForm(!showEvaluationForm)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  {showEvaluationForm ? 'Annuler' : '+ Créer une Évaluation'}
                </button>

                {showEvaluationForm && (
                  <form onSubmit={handleSubmitEvaluation} className="mt-6 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-blue-900">
                        Remplissez cette évaluation pour documenter les résultats de l'entretien.
                      </p>
                    </div>

                    {/* Critères d'évaluation */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Critères d'Évaluation (0-5)</h3>
                      
                      {['diagnostiquer', 'produire', 'valider', 'adapter', 'communiquer'].map((criterion) => (
                        <div key={criterion} className="flex items-center justify-between">
                          <label className="text-gray-700 font-medium capitalize">
                            {criterion === 'diagnostiquer' ? 'Diagnostiquer' :
                             criterion === 'produire' ? 'Produire' :
                             criterion === 'valider' ? 'Valider' :
                             criterion === 'adapter' ? "s'Adapter" :
                             'Communiquer'}
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              name={criterion}
                              min="0"
                              max="5"
                              step="1"
                              value={formData[criterion]}
                              onChange={handleInputChange}
                              className="w-40"
                            />
                            <span className="text-xl font-bold text-blue-600 w-8 text-center">
                              {formData[criterion]}/5
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Commentaires */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Points Forts</label>
                      <textarea
                        name="pointsForts"
                        value={formData.pointsForts}
                        onChange={handleInputChange}
                        placeholder="Décrivez les points positifs..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Axes d'Amélioration</label>
                      <textarea
                        name="axesAmelioration"
                        value={formData.axesAmelioration}
                        onChange={handleInputChange}
                        placeholder="Suggestions d'amélioration..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Commentaires Généraux</label>
                      <textarea
                        name="commentairesGeneral"
                        value={formData.commentairesGeneral}
                        onChange={handleInputChange}
                        placeholder="Commentaires additionnels..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Recommandation</label>
                      <select
                        name="recommandation"
                        value={formData.recommandation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="VALIDER">✓ Valider</option>
                        <option value="REDISCUTER">⟳ Rediscuter</option>
                        <option value="REJETER">✕ Rejeter</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
                    >
                      {submitLoading ? 'Soumission...' : 'Soumettre l\'Évaluation'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Résumé de l'évaluation existante */}
            {evaluation && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Évaluation Reçue</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Évaluateur:</span>
                    <span className="font-semibold text-gray-900">{evaluation.evaluateur}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score Global:</span>
                    <span className={`text-2xl font-bold ${
                      stats?.scoreGlobalMoyen >= 4 ? 'text-green-600' :
                      stats?.scoreGlobalMoyen >= 3 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {stats?.scoreGlobalMoyen?.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recommandation:</span>
                    <span className={`font-semibold px-3 py-1 rounded ${
                      evaluation.recommandation === 'VALIDER' ? 'bg-green-100 text-green-800' :
                      evaluation.recommandation === 'REDISCUTER' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {evaluation.recommandation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">État:</span>
                    <span className="font-semibold text-gray-900">{evaluation.etat}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale - Statistiques */}
          {stats && (
            <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase mb-1">Diagnostiquer</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.moyenneDiagnostiquer?.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase mb-1">Produire</p>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.moyenneProduire?.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase mb-1">Valider</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {stats.moyenneValider?.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase mb-1">S'Adapter</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {stats.moyenneAdapter?.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase mb-1">Communiquer</p>
                  <p className="text-2xl font-bold text-pink-700">
                    {stats.moyenneCommuniquer?.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanificationEntretienPage;
