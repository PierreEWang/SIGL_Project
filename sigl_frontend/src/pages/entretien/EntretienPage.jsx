import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import entretienPlanificationService from '../../services/entretienPlanificationService';

const EntretienPage = () => {
  const navigate = useNavigate();
  const [entretiens, setEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('TOUS');

  useEffect(() => {
    loadEntretiens();
  }, []);

  const loadEntretiens = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await entretienPlanificationService.getMesEntretiens();
      setEntretiens(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les entretiens');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmer = async (id) => {
    try {
      await entretienPlanificationService.confirmerEntretien(id);
      loadEntretiens();
      alert('Entretien confirmé');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const handleAnnuler = async (id) => {
    try {
      await entretienPlanificationService.annulerEntretien(id);
      loadEntretiens();
      alert('Entretien annulé');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'DEMANDE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRME':
        return 'bg-green-100 text-green-800';
      case 'ANNULE':
        return 'bg-red-100 text-red-800';
      case 'TERMINE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEntretiens = filterStatus === 'TOUS' 
    ? entretiens 
    : entretiens.filter(e => e.statut === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📅 Mes Entretiens</h1>
            <p className="text-gray-600">Gestion et planification de vos entretiens d'apprentissage</p>
          </div>
          <button
            onClick={() => navigate('/entretiens/creer')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition transform hover:scale-105"
          >
            + Créer un entretien
          </button>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['TOUS', 'DEMANDE', 'CONFIRME', 'TERMINE', 'ANNULE'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'TOUS' ? 'Tous' : status}
            </button>
          ))}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des entretiens */}
        {filteredEntretiens.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Aucun entretien trouvé</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Retour au dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntretiens.map(entretien => (
              <div
                key={entretien._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 overflow-hidden"
              >
                {/* Header du card */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold truncate flex-1">{entretien.objet}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(entretien.statut)}`}>
                      {entretien.statut}
                    </span>
                  </div>
                </div>

                {/* Contenu du card */}
                <div className="p-4 space-y-3">
                  {/* Date et heure */}
                  {entretien.creneau && (
                    <div>
                      <p className="text-xs text-gray-600 uppercase font-semibold mb-1">📅 Date & Heure</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {new Date(entretien.creneau.debut).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Participants */}
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1">👥 Participants ({entretien.participants?.length || 0})</p>
                    <div className="space-y-1">
                      {entretien.participants?.slice(0, 2).map((participant, idx) => (
                        <p key={idx} className="text-sm text-gray-700">
                          {participant.nom} {participant.prenom}
                          {participant.email && <span className="text-xs text-gray-500"> • {participant.email}</span>}
                        </p>
                      ))}
                      {entretien.participants?.length > 2 && (
                        <p className="text-xs text-gray-500">+{entretien.participants.length - 2} autres</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    {entretien.statut === 'DEMANDE' && (
                      <>
                        <button
                          onClick={() => handleConfirmer(entretien._id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition text-sm"
                        >
                          ✓ Confirmer
                        </button>
                        <button
                          onClick={() => handleAnnuler(entretien._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition text-sm"
                        >
                          ✕ Annuler
                        </button>
                      </>
                    )}
                    {entretien.statut === 'CONFIRME' && (
                      <button
                        onClick={() => navigate(`/entretiens/${entretien._id}/planification`)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition text-sm"
                      >
                        📝 Évaluer
                      </button>
                    )}
                    {entretien.statut === 'TERMINE' && (
                      <button
                        onClick={() => navigate(`/entretiens/${entretien._id}/planification`)}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition text-sm"
                      >
                        📊 Voir Résultats
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntretienPage;
