import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';


const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

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
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-700">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Apprenti - {currentUser?.role || 'APPRENTI'}</p>
                </div>
              </div>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
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

// Composant Journal de Formation
const JournalTab = ({ navigate }) => {
  const [journaux, setJournaux] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simuler le chargement des journaux depuis l'API
  React.useEffect(() => {
    // TODO: Remplacer par un vrai appel API
    const fetchJournaux = async () => {
      try {
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Pour l'instant, récupérer depuis localStorage (temporaire)
        const savedJournaux = localStorage.getItem('journaux');
        if (savedJournaux) {
          const data = JSON.parse(savedJournaux);
          // Trier par date (plus récent en premier)
          const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setJournaux(sorted);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des journaux:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournaux();
  }, []);

  // Formater le mois en français
  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Formater la date complète
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📔 Journal de Formation</h2>
        <p className="text-gray-600 mb-6">
          Renseignez vos activités mensuelles et consultez l'historique de votre formation.
        </p>

        {/* Bouton nouvelle note */}
        <button 
          onClick={() => navigate('/journal/create')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium mb-6 transition"
        >
          + Ajouter une note mensuelle
        </button>

        {/* État de chargement */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement des notes...</p>
          </div>
        ) : (
          <>
            {/* Liste des notes mensuelles */}
            {journaux.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Notes enregistrées ({journaux.length})
                </h3>
                
                {journaux.map((journal, index) => (
                  <div 
                    key={journal.id || index} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/journal/${journal.id || index}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {formatMonth(journal.createdAt || journal.periodes[0]?.dateDebut)}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Dernière modification : {formatDate(journal.updatedAt || journal.createdAt)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-600">
                            📅 {journal.periodes?.length || 0} période(s)
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            📝 {journal.periodes?.reduce((sum, p) => sum + (p.missions?.length || 0), 0) || 0} mission(s)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          journal.status === 'validee' 
                            ? 'bg-green-100 text-green-800' 
                            : journal.status === 'en_attente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {journal.status === 'validee' ? 'Validée' : 
                           journal.status === 'en_attente' ? 'En attente' : 
                           'En cours'}
                        </span>
                        <button 
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/journal/${journal.id || index}`);
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
              /* Message si aucune note */
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">📔</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Aucune note mensuelle
                </h3>
                <p className="text-gray-600 mb-4">
                  Commencez par créer votre première note de formation
                </p>
                <button 
                  onClick={() => navigate('/journal/create')}
                  className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  + Créer ma première note
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


// Composant Documents
const DocumentsTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Mes Documents</h2>
      <p className="text-gray-600 mb-6">
        Déposez et consultez vos livrables : fiches de synthèse, rapports, présentations.
      </p>

      {/* Catégories de documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Fiches de synthèse', count: 3, icon: '📝', color: 'blue' },
          { name: 'Rapports de projet', count: 2, icon: '📊', color: 'green' },
          { name: 'Présentations', count: 5, icon: '📽️', color: 'purple' },
          { name: 'Mémoire final', count: 1, icon: '📘', color: 'red' },
          { name: 'États d\'avancement', count: 4, icon: '📈', color: 'yellow' },
          { name: 'Autres documents', count: 2, icon: '📎', color: 'gray' },
        ].map((category, index) => (
          <div
            key={index}
            className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-500 hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.count} document(s)</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Composant Calendrier
const CalendarTab = ({ navigate }) => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des événements à venir
  React.useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/calendar/events');
        const data = await response.json();
        
        if (data.success) {
          // Filtrer les événements futurs et prendre les 5 premiers
          const now = new Date();
          const futureEvents = data.data
            .filter(event => new Date(event.date) >= now)
            .slice(0, 5);
          setUpcomingEvents(futureEvents);
        } else {
          setError('Erreur lors du chargement des événements');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        setError('Impossible de charger les événements');
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingEvents();
  }, []);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Fonction pour obtenir le type d'événement basé sur la catégorie
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
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Événements à venir</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Chargement des événements...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">
              <p>{error}</p>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-primary-600 bg-blue-50 p-4 rounded-r-lg cursor-pointer hover:bg-blue-100 transition"
                     onClick={() => navigate(`/calendar/event/${event.id}`)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">📅 {formatDate(event.date)}</p>
                      {event.time && (
                        <p className="text-sm text-gray-500">🕒 {event.time}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      {getEventType(event.category)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun événement à venir</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant Entretiens
const EntretiensTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">💬 Entretiens Semestriels</h2>
      <p className="text-gray-600 mb-6">
        Organisez vos entretiens avec votre tuteur pédagogique et maître d'apprentissage.
      </p>

      <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium mb-6 transition">
        + Organiser un entretien
      </button>

      {/* Liste des entretiens */}
      <div className="space-y-4">
        {[
          { semester: 'Semestre 8', status: 'À planifier', participants: ['Tuteur TP', 'Maître MA'] },
          { semester: 'Semestre 7', status: 'Effectué', date: '2025-06-20', participants: ['Tuteur TP', 'Maître MA'] },
        ].map((entretien, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-800">{entretien.semester}</h4>
                {entretien.date && (
                  <p className="text-sm text-gray-500 mt-1">Date: {entretien.date}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                entretien.status === 'Effectué' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {entretien.status}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Participants:</span>
              {entretien.participants.map((p, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Composant Notifications
const NotificationsTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🔔 Notifications</h2>
      <p className="text-gray-600 mb-6">
        Consultez vos notifications et ne manquez aucune échéance importante.
      </p>

      <div className="space-y-3">
        {[
          { type: 'warning', title: 'Échéance proche', message: 'Dépôt du rapport de projet dans 5 jours', time: 'Il y a 2h' },
          { type: 'info', title: 'Nouveau commentaire', message: 'Votre tuteur a commenté votre note mensuelle', time: 'Il y a 1 jour' },
          { type: 'success', title: 'Document validé', message: 'Votre fiche de synthèse a été validée', time: 'Il y a 2 jours' },
        ].map((notif, index) => (
          <div key={index} className={`border-l-4 p-4 rounded-r-lg ${
            notif.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
            notif.type === 'info' ? 'border-blue-500 bg-blue-50' :
            'border-green-500 bg-green-50'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{notif.title}</h4>
                <p className="text-sm text-gray-600">{notif.message}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StudentDashboard;
