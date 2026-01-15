import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import entretienPlanificationService from '../../services/entretienPlanificationService';

const CreerEntretienPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    objet: '',
    description: '',
    debut: '',
    fin: '',
    participants: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.objet.trim()) {
      setError('L\'objet de l\'entretien est obligatoire');
      return;
    }
    
    if (!formData.debut) {
      setError('La date/heure de début est obligatoire');
      return;
    }

    if (!formData.fin) {
      setError('La date/heure de fin est obligatoire');
      return;
    }

    // Vérifier que fin > debut
    if (new Date(formData.fin) <= new Date(formData.debut)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse participants (format: email1, email2, email3)
      const participantEmails = formData.participants
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      if (participantEmails.length < 1) {
        setError('Au moins un autre participant est requis (en plus de vous)');
        return;
      }

      const payload = {
        objet: formData.objet,
        description: formData.description || undefined,
        debut: formData.debut,
        fin: formData.fin,
        participants: participantEmails
      };

      await entretienPlanificationService.demanderEntretien(payload);
      
      alert('Entretien créé avec succès !');
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur création entretien:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la création';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📅 Demander un Entretien</h1>
          <p className="text-gray-600">Planifiez une nouvelle séance avec votre tuteur ou maître d'apprentissage</p>
        </div>

        {/* Carte du formulaire */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Objet */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Objet de l'entretien *
              </label>
              <input
                type="text"
                name="objet"
                value={formData.objet}
                onChange={handleInputChange}
                placeholder="Ex: Bilan trimestre Q1, Point sur les compétences..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description (optionnel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Contexte et détails supplémentaires..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                disabled={loading}
              />
            </div>

            {/* Dates et heures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Début *
                </label>
                <input
                  type="datetime-local"
                  name="debut"
                  value={formData.debut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fin *
                </label>
                <input
                  type="datetime-local"
                  name="fin"
                  value={formData.fin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Autres participants (e-mails séparés par des virgules) *
              </label>
              <textarea
                name="participants"
                value={formData.participants}
                onChange={handleInputChange}
                placeholder="tuteur@example.com, maitre.apprentissage@example.com"
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Vous serez automatiquement ajouté comme participant. Incluez votre tuteur ou maître d'apprentissage.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Création en cours...
                  </>
                ) : (
                  '✓ Créer l\'entretien'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕ Annuler
              </button>
            </div>
          </form>
        </div>

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Note:</strong> Après création, l'entretien sera en statut <strong>DEMANDE</strong>. Il devra être confirmé par les participants avant de pouvoir être évalué.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreerEntretienPage;
