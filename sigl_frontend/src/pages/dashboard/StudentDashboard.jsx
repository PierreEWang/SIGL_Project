import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import journalService from '../../services/journalService';
import bookingService from '../../services/bookingService';
import CalendarPage from '../calendar/CalendarPage';
import DocumentsPage from '../documents/DocumentsPage';
import EntretienPage from '../entretien/EntretienPage';

/**
 * Dashboard principal de l'apprenti
 */
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const [journaux, setJournaux] = useState([]);
  const [journauxLoading, setJournauxLoading] = useState(false);
  const [journauxError, setJournauxError] = useState(null);
  
  // State for entretiens
  const [entretiens, setEntretiens] = useState([]);
  const [entretiensLoading, setEntretiensLoading] = useState(false);
  const [entretiensError, setEntretiensError] = useState(null);
  
  // State for soutenance
  const [soutenance, setSoutenance] = useState(null);
  const [soutenanceLoading, setSoutenanceLoading] = useState(false);
  const [soutenanceError, setSoutenanceError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();


  // --- Gestion logout ---
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  // --- Gestion navigation vers profil ---
  const handleProfileClick = () => {
    console.log('Profile clicked - navigating to /profile');
    navigate('/profile');
  };

  // --- Infos user (nom + avatar) ---
  const displayName =
    [currentUser?.prenom || currentUser?.firstName, currentUser?.nom || currentUser?.lastName]
      .filter(Boolean)
      .join(' ') ||
    currentUser?.nom ||
    currentUser?.email ||
    'Utilisateur';

  const avatarUrl = currentUser?.avatar || currentUser?.avatarUrl || null;
  const avatarLetter = displayName?.trim()?.charAt(0)?.toUpperCase() || '?';
  const roleLabel = currentUser?.role || 'APPRENTI';

  // --- Onglets du dashboard ---
  const tabs = [
    { id: 'journal', name: 'Journal de formation', icon: '📔' },
    { id: 'documents', name: 'Mes documents', icon: '📄' },
    { id: 'calendar', name: 'Calendrier', icon: '📅' },
    { id: 'entretiens', name: 'Entretiens & Soutenances', icon: '💬' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
  ];

  // --- Chargement des journaux pour l'onglet Journal ---
  useEffect(() => {
    const loadJournaux = async () => {
      try {
        setJournauxLoading(true);
        setJournauxError(null);
        const data = await journalService.getMyJournaux();
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setJournaux(sorted);
      } catch (error) {
        console.error('Erreur lors du chargement des journaux :', error);
        setJournauxError("Impossible de charger votre journal de formation pour le moment.");
      } finally {
        setJournauxLoading(false);
      }
    };

    loadJournaux();
  }, []);

  // --- Chargement des entretiens avec bookingService (comme MesEntretiensPage) ---
  useEffect(() => {
    const loadEntretiens = async () => {
      try {
        setEntretiensLoading(true);
        setEntretiensError(null);
        
        const result = await bookingService.getMesEntretiens();
        if (result.success) {
          setEntretiens(result.data || []);
        } else {
          setEntretiensError("Impossible de charger vos entretiens pour le moment.");
        }
      } catch (error) {
        console.error('Erreur lors du chargement des entretiens :', error);
        setEntretiensError("Impossible de charger vos entretiens pour le moment.");
      } finally {
        setEntretiensLoading(false);
      }
    };

    loadEntretiens();
  }, []);

  // --- Chargement de la soutenance avec bookingService ---
  useEffect(() => {
    const loadSoutenance = async () => {
      try {
        setSoutenanceLoading(true);
        setSoutenanceError(null);
        
        const result = await bookingService.getMaSoutenance();
        if (result.success) {
          setSoutenance(result.data);
        } else {
          setSoutenanceError("Impossible de charger votre soutenance pour le moment.");
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la soutenance :', error);
        setSoutenanceError("Impossible de charger votre soutenance pour le moment.");
      } finally {
        setSoutenanceLoading(false);
      }
    };

    loadSoutenance();
  }, []);

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'EN_COURS':
        return 'En cours';
      case 'SOUMIS':
        return 'Soumis';
      case 'VALIDE':
        return 'Validé';
      default:
        return 'En cours';
    }
  };

  const handleOpenJournal = (id) => {
    navigate(`/journal/${id}`);
  };

  const handleCreateJournal = () => {
    navigate('/journal/create');
  };

  const getEntretienStatusLabel = (status) => {
    switch (status) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'CONFIRME':
        return 'Confirmé';
      case 'ANNULE':
        return 'Annulé';
      default:
        return 'En attente';
    }
  };

  const getSoutenanceStatusLabel = (status) => {
    switch (status) {
      case 'PLANIFIEE':
        return 'Planifiée';
      case 'VALIDEE':
        return 'Validée';
      case 'ANNULEE':
        return 'Annulée';
      default:
        return 'Planifiée';
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  // --- Rendu du contenu par onglet ---
  const renderContent = () => {
    switch (activeTab) {
      case 'journal':
        return (
          <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Journal de formation</h2>
                <p className="text-sm text-gray-500">Suivez vos missions et périodes d'alternance.</p>
              </div>
              <button
                type="button"
                onClick={handleCreateJournal}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-200"
              >
                + Créer un journal
              </button>
            </div>

            {journauxLoading && (
              <div className="py-6 text-sm text-gray-500">Chargement de vos journaux...</div>
            )}

            {journauxError && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {journauxError}
              </div>
            )}

            {!journauxLoading && !journauxError && journaux.length === 0 && (
              <div className="py-10 text-center text-sm text-gray-500">
                Aucun journal pour le moment.
                <br />
                Cliquez sur «&nbsp;Créer un journal&nbsp;» pour commencer à consigner vos missions.
              </div>
            )}

            {!journauxLoading && !journauxError && journaux.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Créé le
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Dernière mise à jour
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Nombre de périodes
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {journaux.map((j, index) => (
                      <tr key={j.id || j._id || `journal-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {formatDate(j.createdAt)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {formatDate(j.updatedAt)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                          {Array.isArray(j.periodes) ? j.periodes.length : 0}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                            {getStatusLabel(j.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenJournal(j.id)}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            Ouvrir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );

      case 'documents':
        return (
          <section className="bg-transparent">
            <DocumentsPage />
          </section>
        );

      case 'calendar':
        return (
          <section>
            <CalendarPage embedded={true} />
          </section>
        );

      case 'entretiens':
        return (
          <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Entretiens & Soutenances</h2>
              
              {entretiensLoading && soutenanceLoading && (
                <div className="py-6 text-sm text-gray-500">Chargement des entretiens et soutenances...</div>
              )}

              {entretiensError && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {entretiensError}
                </div>
              )}

              {soutenanceError && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {soutenanceError}
                </div>
              )}

              {!entretiensLoading && entretiens.length === 0 && (
                <div className="py-6 text-sm text-gray-500 mb-6">
                  Aucun entretien programmé pour le moment.
                </div>
              )}

              {!entretiensLoading && entretiens.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-800 mb-3">Mes entretiens</h3>
                  <div className="space-y-3">
                    {entretiens.map((entretien, index) => (
                      <div key={entretien.id || `entretien-${index}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{entretien.titre || 'Entretien'}</p>
                            <p className="text-sm text-gray-600">{formatDateTime(entretien.dateHeure)}</p>
                          </div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                            {getEntretienStatusLabel(entretien.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!soutenanceLoading && soutenance && (
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-3">Ma soutenance</h3>
                  <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Soutenance finale</p>
                        <p className="text-sm text-gray-600">{formatDateTime(soutenance.dateHeure)}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700">
                        {getSoutenanceStatusLabel(soutenance.status)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!soutenanceLoading && !soutenance && (
                <div className="py-6 text-sm text-gray-500">
                  Aucune soutenance programmée pour le moment.
                </div>
              )}
            </div>
          </section>
        );

      case 'notifications':
        return (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-sm text-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h2>
            <p>Module à venir : notifications importantes liées à votre alternance.</p>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-xl">I</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">IZIA</h1>
                <p className="text-xs text-white/80">Espace étudiant</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Bloc utilisateur cliquable vers /profile */}
              <Link
                to="/profile"
                className="hidden md:flex items-center space-x-2 hover:bg-white/10 px-3 py-1 rounded-lg transition duration-200"
              >
                {avatarUrl ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover border border-white/20"
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                  />
                ) : (
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{avatarLetter}</span>
                  </div>
                )}

                <div className="text-sm text-right">
                  <p className="font-medium text-white">{displayName}</p>
                  <p className="text-xs text-white/80">{roleLabel}</p>
                </div>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 bg-white/10 hover:bg-white/20"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium flex items-center space-x-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-md'
                      : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-t-md'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;