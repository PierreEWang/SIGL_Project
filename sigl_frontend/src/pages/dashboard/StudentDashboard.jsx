import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import journalService from '../../services/journalService';

/**
 * Dashboard principal de l'apprenti
 */
const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('journal');
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    // --- Gestion logout ---
    const handleLogout = async () => {
        await authService.logout();
        navigate('/');
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
                            <Link
                                to="/profile"
                                className="hidden md:flex items-center space-x-2 hover:bg-gray-100 px-3 py-1 rounded-lg transition"
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={`${displayName} avatar`}
                                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {avatarLetter}
                    </span>
                                    </div>
                                )}
                                <div className="text-sm text-right">
                                    <p className="font-medium text-gray-700">{displayName}</p>
                                    <p className="text-xs text-gray-500">{roleLabel}</p>
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

// ========== JOURNAL TAB ==========
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
                setError('Impossible de charger votre journal de formation pour le moment.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJournaux();
    }, []);

    const formatMonth = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'EN_COURS':
                return { label: 'En cours', class: 'bg-blue-100 text-blue-800' };
            case 'SOUMIS':
                return { label: 'Soumis', class: 'bg-yellow-100 text-yellow-800' };
            case 'VALIDE':
                return { label: 'Validé', class: 'bg-green-100 text-green-800' };
            default:
                return { label: 'En cours', class: 'bg-blue-100 text-blue-800' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📔 Journal de Formation</h2>
                <p className="text-gray-600 mb-6">
                    Renseignez vos activités mensuelles et consultez l'historique de votre formation.
                </p>

                <button
                    onClick={() => navigate('/journal/create')}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium mb-6 transition"
                >
                    + Ajouter une note mensuelle
                </button>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Chargement des notes...</p>
                    </div>
                ) : error ? (
                    <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : journaux.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            Notes enregistrées ({journaux.length})
                        </h3>

                        {journaux.map((journal, index) => {
                            const status = getStatusLabel(journal.status);
                            return (
                                <div
                                    key={journal.id || index}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                                    onClick={() => navigate(`/journal/${journal.id || index}`)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">
                                                {formatMonth(journal.createdAt || journal.periodes?.[0]?.dateDebut)}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                        {status.label}
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
                            );
                        })}
                    </div>
                ) : (
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
            </div>
        </div>
    );
};

// ========== DOCUMENTS TAB ==========
const DocumentsTab = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Mes Documents</h2>
            <p className="text-gray-600 mb-6">
                Déposez et consultez vos livrables : fiches de synthèse, rapports, présentations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { name: 'Fiches de synthèse', count: 3, icon: '📝' },
                    { name: 'Rapports de projet', count: 2, icon: '📊' },
                    { name: 'Présentations', count: 5, icon: '📽️' },
                    { name: 'Mémoire final', count: 1, icon: '📘' },
                    { name: 'États d\'avancement', count: 4, icon: '📈' },
                    { name: 'Autres documents', count: 2, icon: '📎' },
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

// ========== CALENDAR TAB ==========
const CalendarTab = ({ navigate }) => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUpcomingEvents = async () => {
            try {
                setLoading(true);
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

                <button
                    onClick={() => navigate('/calendar')}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium mb-6 transition"
                >
                    📅 Ouvrir le calendrier complet
                </button>

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
                                <div
                                    key={event.id}
                                    className="border-l-4 border-primary-600 bg-blue-50 p-4 rounded-r-lg cursor-pointer hover:bg-blue-100 transition"
                                    onClick={() => navigate(`/calendar/event/${event.id}`)}
                                >
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

// ========== ENTRETIENS TAB ==========
const EntretiensTab = () => {
    const nav = useNavigate();
    const [entretiens, setEntretiens] = useState([]);
    const [soutenance, setSoutenance] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getStatutBadge = (statut) => {
        const badges = {
            'DEMANDE': 'bg-yellow-100 text-yellow-800',
            'CONFIRME': 'bg-green-100 text-green-800',
            'PLANIFIEE': 'bg-blue-100 text-blue-800',
            'VALIDEE': 'bg-green-100 text-green-800',
            'ANNULE': 'bg-red-100 text-red-800',
            'TERMINE': 'bg-gray-100 text-gray-800'
        };
        return badges[statut] || 'bg-gray-100 text-gray-800';
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const entretiensResult = await fetch('http://localhost:3000/api/entretiens/mes-entretiens', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                }).then(r => r.json()).catch(() => ({ data: [] }));

                const soutenanceResult = await fetch('http://localhost:3000/api/soutenances/ma-soutenance', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
                }).then(r => r.json()).catch(() => ({ data: null }));

                setEntretiens(entretiensResult.data || []);
                setSoutenance(soutenanceResult.data);
            } catch (err) {
                console.error('Erreur chargement:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section Entretiens */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">💬 Mes Entretiens</h2>
                    <button
                        onClick={() => nav('/entretien/demande')}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        + Demander un entretien
                    </button>
                </div>

                {entretiens.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600">Aucun entretien planifié</p>
                        <button
                            onClick={() => nav('/entretien/demande')}
                            className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Demander un entretien →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entretiens.slice(0, 3).map((entretien) => (
                            <div key={entretien._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{entretien.objet}</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            📅 {formatDate(entretien.creneau?.debut)}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(entretien.statut)}`}>
                    {entretien.statut}
                  </span>
                                </div>
                            </div>
                        ))}
                        {entretiens.length > 3 && (
                            <button
                                onClick={() => nav('/entretien/liste')}
                                className="w-full text-center py-2 text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Voir tous les entretiens ({entretiens.length}) →
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Section Soutenance */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎓 Ma Soutenance</h2>

                {!soutenance ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-4xl mb-3">🎓</div>
                        <p className="text-gray-600">Soutenance non encore planifiée</p>
                        <p className="text-sm text-gray-500 mt-1">
                            La coordination vous informera une fois votre soutenance planifiée
                        </p>
                    </div>
                ) : (
                    <div
                        className="border-l-4 border-primary-600 bg-blue-50 p-4 rounded-r-lg cursor-pointer hover:bg-blue-100 transition"
                        onClick={() => nav('/soutenance/ma-soutenance')}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-gray-800">Soutenance de fin d'études</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    📅 {formatDate(soutenance.dateHeure)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    📍 {soutenance.salle || 'Salle à définir'}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    👥 Jury: {soutenance.jury?.professeurs?.length || 0} membres
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(soutenance.etat)}`}>
                {soutenance.etat}
              </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ========== NOTIFICATIONS TAB ==========
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
                    <div
                        key={index}
                        className={`border-l-4 p-4 rounded-r-lg ${
                            notif.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                                notif.type === 'info' ? 'border-blue-500 bg-blue-50' :
                                    'border-green-500 bg-green-50'
                        }`}
                    >
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