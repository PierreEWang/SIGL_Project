import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import journalService from '../../services/journalService';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  // Nom affiché : on privilégie "nom", puis firstName + lastName
  const displayName =
    currentUser?.nom ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    'Utilisateur';

  const avatarLetter =
    displayName?.trim()?.charAt(0)?.toUpperCase() || '?';

  const roleLabel = currentUser?.role || 'APPRENTI';

  const tabs = [
    { id: 'journal', name: 'Journal de Formation', icon: '📔' },
    { id: 'documents', name: 'Mes Documents', icon: '📄' },
    { id: 'calendar', name: 'Calendrier', icon: '📅' },
    { id: 'entretiens', name: 'Entretiens', icon: '💬' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">IZIA</h1>
                <p className="text-xs text-gray-500">Espace Étudiant</p>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* Bloc utilisateur cliquable vers /profile */}
              <Link
                to="/profile"
                className="hidden md:flex items-center space-x-2 hover:bg-gray-100 px-3 py-1 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {avatarLetter}
                  </span>
                </div>
                <div className="text-sm text-right">
                  <p className="font-medium text-gray-700">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {roleLabel}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'journal' && <JournalTab navigate={navigate} />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'calendar' && <CalendarTab navigate={navigate} />}
        {activeTab === 'entretiens' && <EntretiensTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </main>
    </div>
  );
};

// ======================
// Onglet Journal
// ======================
const JournalTab = ({ navigate }) => {
  const [journaux, setJournaux] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournaux = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await journalService.getMyJournaux();

        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setJournaux(sorted);
      } catch (err) {
        console.error('Erreur lors du chargement des journaux:', err);
        setError("Impossible de charger vos journaux de formation.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournaux();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('fr-FR');
  };

  const formatMonth = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  const missionsCount = (journal) =>
    journal.periodes?.reduce(
      (sum, p) => sum + (p.missions?.length || 0),
      0
    ) || 0;

  if (isLoading) {
    return <p className="text-gray-600">Chargement des journaux...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Journal de Formation
          </h2>
          <p className="text-sm text-gray-500">
            Renseignez vos activités mensuelles et consultez l'historique de
            votre formation.
          </p>
        </div>
        <button
          onClick={() => navigate('/journal/create')}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
        >
          + Ajouter une note mensuelle
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {journaux.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            Notes enregistrées ({journaux.length})
          </h3>

          {journaux.map((journal) => (
            <div
              key={journal.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/journal/${journal.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800 capitalize">
                    {formatMonth(
                      journal.createdAt || journal.periodes[0]?.dateDebut
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Dernière modification :{' '}
                    {formatDate(journal.updatedAt || journal.createdAt)}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-600">
                      📅 {journal.periodes?.length || 0} période(s)
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">
                      📝 {missionsCount(journal)} mission(s)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      journal.status === 'validee'
                        ? 'bg-green-100 text-green-800'
                        : journal.status === 'en_attente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {journal.status === 'validee'
                      ? 'Validée'
                      : journal.status === 'en_attente'
                      ? 'En attente'
                      : 'En cours'}
                  </span>
                  <button
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/journal/${journal.id}`);
                    }}
                  >
                    Consulter →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📔</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Aucune note mensuelle
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Commencez par créer votre première note de formation.
          </p>
          <button
            onClick={() => navigate('/journal/create')}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
          >
            + Créer ma première note
          </button>
        </div>
      )}
    </div>
  );
};

// Les autres onglets peuvent rester tels que tu les avais
const DocumentsTab = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Mes Documents</h2>
    <p className="text-gray-600 text-sm">
      À implémenter : dépôt et suivi des documents.
    </p>
  </div>
);

const CalendarTab = ({ navigate }) => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des événements à venir
  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:3000/api/calendar/events');
        const data = await response.json();

        if (data.success) {
          const now = new Date();
          const futureEvents = data.data
            .filter(event => new Date(event.date) >= now)
            .slice(0, 5);
          setUpcomingEvents(futureEvents);
        } else {
          setError('Erreur lors du chargement des événements');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setError('Impossible de charger les événements');
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingEvents();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getEventType = (category) => {
    const types = {
      'réunion': 'Réunion',
      'rendez-vous': 'Rendez-vous',
      'culturel': 'Culturel',
      'formation': 'Formation'
    };
    return types[category] || 'Événement';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Calendrier</h2>
        <p className="text-gray-600 mb-6">
          Consultez vos événements, soutenances et dates importantes.
        </p>

        {/* Bouton pour accéder au calendrier complet */}
        <button
          onClick={() => navigate('/calendar')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium mb-6 transition"
        >
          📅 Ouvrir le calendrier complet
        </button>

        {/* Événements à venir */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Événements à venir
          </h3>

          {loading ? (
            <p className="text-sm text-gray-500">Chargement des événements…</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun événement à venir pour le moment.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map(event => (
                <li
                  key={event.id}
                  className="flex items-start justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(event.date)} • {event.time} •{' '}
                      {getEventType(event.category)}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-400 mt-1">
                        {event.location}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/calendar/event/${event.id}`)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Détails →
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const EntretiensTab = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Entretiens</h2>
    <p className="text-gray-600 text-sm">
      À implémenter : liste et compte-rendus d’entretiens.
    </p>
  </div>
);

const NotificationsTab = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
    <p className="text-gray-600 text-sm">
      À implémenter : notifications importantes pour votre suivi.
    </p>
  </div>
);

export default StudentDashboard;