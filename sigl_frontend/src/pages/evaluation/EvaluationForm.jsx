import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/Api';

const COMPETENCES_INGENIEURS = [
  { id: 'analyse_conception', label: 'Analyse & Conception', description: 'Capacité à analyser et concevoir des solutions techniques' },
  { id: 'programmation', label: 'Programmation', description: 'Maîtrise des langages et des bonnes pratiques de code' },
  { id: 'gestion_projet', label: 'Gestion de Projet', description: 'Capacité à gérer les ressources, délais et risques' },
  { id: 'communication', label: 'Communication', description: 'Capacité à communiquer et présenter' },
  { id: 'travail_equipe', label: 'Travail en Équipe', description: 'Collaboration et travail en groupe' },
  { id: 'apprentissage', label: 'Capacité d\'Apprentissage', description: 'Autonomie et apprentissage continu' },
  { id: 'innovation', label: 'Innovation & Créativité', description: 'Proposer des solutions nouvelles' },
  { id: 'leadership', label: 'Leadership', description: 'Capacité à motiver et guider' },
  { id: 'qualite', label: 'Rigueur & Qualité', description: 'Attention aux détails et à la qualité' },
  { id: 'ethique', label: 'Éthique Professionnelle', description: 'Respect des valeurs et de la déontologie' },
];

const RATING_SCALE = [
  { value: 1, label: '1', color: 'text-red-600', bgColor: 'bg-red-100', tooltip: 'Insuffisant' },
  { value: 2, label: '2', color: 'text-orange-600', bgColor: 'bg-orange-100', tooltip: 'À améliorer' },
  { value: 3, label: '3', color: 'text-yellow-600', bgColor: 'bg-yellow-100', tooltip: 'Satisfaisant' },
  { value: 4, label: '4', color: 'text-blue-600', bgColor: 'bg-blue-100', tooltip: 'Bon' },
  { value: 5, label: '5', color: 'text-green-600', bgColor: 'bg-green-100', tooltip: 'Excellent' },
];

const EvaluationForm = () => {
  const navigate = useNavigate();
  const { entretienId } = useParams();

  const [apprenticeId, setApprenticeId] = useState('');
  const [apprentices, setApprentices] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [commentaires, setCommentaires] = useState({});
  const [pointsForts, setPointsForts] = useState('');
  const [axesAmelioration, setAxesAmelioration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const currentUser = authService.getCurrentUser();

  // Charger les apprentices assignés au tuteur
  useEffect(() => {
    const loadApprentices = async () => {
      try {
        const token = authService.getAccessToken();
        if (!token) {
          setError('Session expirée. Merci de vous reconnecter.');
          return;
        }

        const response = await api.get('/users/tuteur/apprentices', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data?.success) {
          setApprentices(response.data.data || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des apprentices:', error);
      }
    };

    if (['MA', 'TP', 'PROF', 'CA', 'RC'].includes(currentUser?.role)) {
      loadApprentices();
    }
  }, [currentUser?.role]);

  // Initialiser les évaluations si un entretien est sélectionné
  useEffect(() => {
    if (entretienId) {
      const newEvals = {};
      COMPETENCES_INGENIEURS.forEach(comp => {
        newEvals[comp.id] = 3; // Défaut à 3 (satisfaisant)
      });
      setEvaluations(newEvals);
    }
  }, [entretienId]);

  const handleRatingChange = (competenceId, rating) => {
    setEvaluations(prev => ({
      ...prev,
      [competenceId]: rating,
    }));
  };

  const handleCommentChange = (competenceId, comment) => {
    setCommentaires(prev => ({
      ...prev,
      [competenceId]: comment,
    }));
  };

  const calculateMoyenne = () => {
    const values = Object.values(evaluations);
    return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apprenticeId) {
      setError('Veuillez sélectionner un apprenti');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        apprenticeId,
        entretienId: entretienId || null,
        evaluationDate: new Date(),
        competences: COMPETENCES_INGENIEURS.map(comp => ({
          competenceId: comp.id,
          label: comp.label,
          note: evaluations[comp.id],
          commentaire: commentaires[comp.id] || '',
        })),
        moyenneGenerale: calculateMoyenne(),
        pointsForts,
        axesAmelioration,
        evaluatedBy: currentUser?._id || currentUser?.id,
      };

      const response = await api.post('/evaluations', payload);

      if (response.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/tuteur-dashboard');
        }, 2000);
      } else {
        setError(response.data?.message || 'Erreur lors de la création de l\'évaluation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la création de l\'évaluation');
    } finally {
      setLoading(false);
    }
  };

  const selectedApprentice = apprentices.find(a => a._id === apprenticeId);
  const moyenneGenerale = calculateMoyenne();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
          >
            <span>←</span>
            <span>Retour</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">⭐ Évaluation de Compétences</h1>
          <p className="text-gray-600 mt-2">Évaluez les compétences d'ingénieur de vos apprentis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              ✓ Évaluation créée avec succès ! Redirection...
            </div>
          )}

          {/* Sélection de l'apprenti */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apprenti <span className="text-red-600">*</span>
                </label>
                <select
                  value={apprenticeId}
                  onChange={(e) => setApprenticeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un apprenti</option>
                  {apprentices.map(apprentice => (
                    <option key={apprentice._id} value={apprentice._id}>
                      {apprentice.prenom} {apprentice.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'évaluation
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {selectedApprentice && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Apprenti sélectionné:</strong> {selectedApprentice.prenom} {selectedApprentice.nom}
                </p>
              </div>
            )}
          </div>

          {/* Compétences */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Compétences d'Ingénieur</h2>
              <div className="text-right">
                <p className="text-xs text-gray-600">Moyenne générale</p>
                <p className="text-2xl font-bold text-blue-600">{moyenneGenerale}/5</p>
              </div>
            </div>

            <div className="space-y-6">
              {COMPETENCES_INGENIEURS.map((competence) => (
                <div key={competence.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  {/* Competence header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{competence.label}</h3>
                      <p className="text-sm text-gray-600">{competence.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        {evaluations[competence.id] || 0}/5
                      </p>
                    </div>
                  </div>

                  {/* Rating scale */}
                  <div className="flex space-x-2 mb-4">
                    {RATING_SCALE.map((rating) => (
                      <button
                        key={rating.value}
                        type="button"
                        onClick={() => handleRatingChange(competence.id, rating.value)}
                        className={`flex-1 py-2 px-3 rounded-lg font-bold transition ${
                          evaluations[competence.id] === rating.value
                            ? `${rating.bgColor} ${rating.color} ring-2 ring-offset-2`
                            : `bg-gray-100 text-gray-600 hover:${rating.bgColor}`
                        }`}
                        title={rating.tooltip}
                      >
                        {rating.label}
                      </button>
                    ))}
                  </div>

                  {/* Comment */}
                  <textarea
                    placeholder={`Commentaire pour ${competence.label}...`}
                    value={commentaires[competence.id] || ''}
                    onChange={(e) => handleCommentChange(competence.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Points forts et axes d'amélioration */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points forts
              </label>
              <textarea
                value={pointsForts}
                onChange={(e) => setPointsForts(e.target.value)}
                placeholder="Décrivez les points forts de l'apprenti..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Axes d'amélioration
              </label>
              <textarea
                value={axesAmelioration}
                onChange={(e) => setAxesAmelioration(e.target.value)}
                placeholder="Décrivez les axes d'amélioration..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !apprenticeId}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Création en cours...' : 'Créer l\'évaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;
