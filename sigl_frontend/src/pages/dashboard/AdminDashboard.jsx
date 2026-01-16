import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/Api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Refetch user depuis le storage après chaque changement d'onglet/action
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // --- Charger les utilisateurs EN_ATTENTE ---
  useEffect(() => {
    const loadPendingUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/users');
        console.log('Response from /users:', response);
        const allUsers = response.data?.data || response.data?.users || response.data || [];
        console.log('All users:', allUsers);
        const pending = allUsers.filter(u => u.status === 'EN_ATTENTE');
        console.log('Pending users:', pending);
        
        setPendingUsers(pending);
      } catch (err) {
        console.error('Erreur lors du chargement des demandes :', err);
        setError('Impossible de charger les demandes de création de compte.');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'requests') {
      loadPendingUsers();
    }
  }, [activeTab]);

  // --- Valider un utilisateur ---
  const handleApprove = async (userId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: 'approving' }));
      
      const response = await api.post(`/users/${userId}/approve`);
      
      // Retirer de la liste
      setPendingUsers((prev) => prev.filter(u => u._id !== userId));
      
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } catch (err) {
      console.error('Erreur lors de la validation :', err);
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      alert('Erreur lors de la validation du compte.');
    }
  };

  // --- Rejeter un utilisateur ---
  const handleReject = async (userId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: 'rejecting' }));
      
      const reason = rejectReason[userId] || 'Rejeté par l\'administrateur';
      
      const response = await api.post(`/users/${userId}/reject`, { reason });
      
      // Retirer de la liste
      setPendingUsers((prev) => prev.filter(u => u._id !== userId));
      
      // Effacer la raison
      setRejectReason((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } catch (err) {
      console.error('Erreur lors du rejet :', err);
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      alert('Erreur lors du rejet du compte.');
    }
  };

  // --- Logout ---
  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  // --- Navigation vers profil ---
  const handleProfileClick = () => {
    navigate('/profile');
  };

  const displayName = [
    currentUser?.firstName || currentUser?.prenom,
    currentUser?.lastName || currentUser?.nom,
  ]
    .filter(Boolean)
    .join(' ') || currentUser?.nom || 'Admin';

  const avatarUrl = currentUser?.avatar;
  const avatarLetter = displayName?.trim()?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚙️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {avatarLetter}
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">Admin</p>
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
              onClick={() => setActiveTab('account')}
              className={`px-4 py-4 font-medium text-sm border-b-2 transition ${
                activeTab === 'account'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Mon Compte Admin
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-4 font-medium text-sm border-b-2 transition ${
                activeTab === 'requests'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Demandes d'inscription ({pendingUsers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab: Account */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">{avatarLetter}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Nom</p>
                  <p className="text-2xl font-semibold text-gray-900">{displayName}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-lg text-gray-900">{currentUser?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rôle</p>
                    <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Administrateur
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Statut</p>
                    <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Actif
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Membre depuis</p>
                    <p className="text-lg text-gray-900">
                      {currentUser?.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Cet compte administrateur ne peut pas être édité depuis le tableau de bord.
                Contactez un administrateur système pour toute modification.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Requests */}
        {activeTab === 'requests' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Chargement des demandes...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {error}
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 text-lg mb-2">Aucune demande en attente</p>
                <p className="text-gray-500">Tous les comptes ont été traités.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        <div className="flex items-center space-x-3 mt-3">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {user.role}
                          </span>
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            En attente
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Demande du{' '}
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>

                    {/* Reject reason input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raison du rejet (si applicable)
                      </label>
                      <input
                        type="text"
                        placeholder="Laisse vide si tu approuves ce compte"
                        value={rejectReason[user._id] || ''}
                        onChange={(e) =>
                          setRejectReason((prev) => ({
                            ...prev,
                            [user._id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(user._id)}
                        disabled={actionLoading[user._id]}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {actionLoading[user._id] === 'approving' ? (
                          <>
                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            <span>Validation en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>✓</span>
                            <span>Valider</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        disabled={actionLoading[user._id]}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {actionLoading[user._id] === 'rejecting' ? (
                          <>
                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            <span>Rejet en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>✕</span>
                            <span>Rejeter</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
