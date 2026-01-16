import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import bookingService from '../../services/bookingService';
import CalendarPage from '../calendar/CalendarPage';

const TutorDashboard = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [entretiens, setEntretiens] = useState([]);
  const [entretiensLoading, setEntretiensLoading] = useState(false);
  const [entretiensError, setEntretiensError] = useState(null);

  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // --- Gestion logout ---
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  // --- Gestion navigation vers profil ---
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // --- Infos user ---
  const displayName =
    [currentUser?.firstName || currentUser?.prenom, currentUser?.lastName || currentUser?.nom]
      .filter(Boolean)
      .join(' ') ||
    currentUser?.nom ||
    'Tuteur';

  const avatarUrl = currentUser?.avatar;
  const avatarLetter = displayName?.trim()?.charAt(0)?.toUpperCase() || 'T';
  const roleLabel = {
    MA: 'Maître d\'Apprentissage',
    TP: 'Tuteur Pédagogique',
    PROF: 'Professeur',
    CA: 'Coordinateur',
    RC: 'Responsable Campus',
  }[currentUser?.role] || currentUser?.role;

  // --- Chargement des entretiens assignés ---
  useEffect(() => {
    const loadEntretiens = async () => {
      try {
        setEntretiensLoading(true);
        setEntretiensError(null);
        
        const result = await bookingService.getMesEntretiens();
        if (result.success) {
          setEntretiens(result.data || []);
        } else {
          setEntretiensError('Impossible de charger les entretiens.');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des entretiens:', error);
        setEntretiensError('Erreur lors du chargement des entretiens.');
      } finally {
        setEntretiensLoading(false);
      }
    };

    if (activeTab === 'entretiens') {
      loadEntretiens();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Tuteur</h1>
              <p className="text-sm text-gray-600">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              onClick={handleProfileClick}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {avatarLetter}
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{currentUser?.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-4 font-medium text-sm border-b-2 transition ${
                activeTab === 'calendar'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              📅 Calendrier & Entretiens
            </button>
            <button
              onClick={() => setActiveTab('entretiens')}
              className={`px-4 py-4 font-medium text-sm border-b-2 transition ${
                activeTab === 'entretiens'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              💬 Mes Entretiens ({entretiens.length})
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`px-4 py-4 font-medium text-sm border-b-2 transition ${
                activeTab === 'evaluations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              ⭐ Évaluations
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton créer entretien */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate('/entretien/demander')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>💬</span>
            Demander un entretien
          </button>
        </div>

        {/* Tab: Calendar */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow">
            <CalendarPage />
          </div>
        )}

        {/* Tab: Entretiens */}
        {activeTab === 'entretiens' && (
          <div>
            {entretiensLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Chargement des entretiens...</p>
              </div>
            ) : entretiensError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {entretiensError}
              </div>
            ) : entretiens.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 text-lg mb-2">Aucun entretien assigné</p>
                <p className="text-gray-500">Les entretiens que tu animes apparaîtront ici.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entretiens.map((entretien) => (
                  <div key={entretien._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entretien.titre || `Entretien ${entretien._id.slice(-6)}`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {entretien.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        entretien.statut === 'CONFIRME' ? 'bg-green-100 text-green-800' :
                        entretien.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entretien.statut}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Date</p>
                        <p className="text-sm font-medium">
                          {entretien.dateDebut ? new Date(entretien.dateDebut).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Heure</p>
                        <p className="text-sm font-medium">
                          {entretien.dateDebut ? new Date(entretien.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Participants</p>
                        <p className="text-sm font-medium">{entretien.participants?.length || 0} personne(s)</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/entretiens/${entretien._id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Voir détails & Évaluer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Evaluations */}
        {activeTab === 'evaluations' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-2">⭐ Évaluations des compétences</p>
            <p className="text-gray-500 mb-6">Évalue les compétences d'ingénieurs des apprentis après chaque entretien.</p>
            <button
              onClick={() => navigate('/evaluations/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Créer une évaluation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;
