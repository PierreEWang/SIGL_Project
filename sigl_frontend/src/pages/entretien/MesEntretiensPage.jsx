import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import authService from '../../services/authService';

const MesEntretiensPage = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const [entretiens, setEntretiens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEntretiens();
    }, []);

    const loadEntretiens = async () => {
        try {
            setLoading(true);
            const result = await bookingService.getMesEntretiens();
            if (result.success) {
                setEntretiens(result.data || []);
            }
        } catch (err) {
            setError('Erreur lors du chargement des entretiens');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmer = async (id) => {
        try {
            await bookingService.confirmerEntretien(id);
            loadEntretiens();
        } catch (err) {
            alert('Erreur lors de la confirmation');
        }
    };

    const handleAnnuler = async (id) => {
        if (window.confirm('Voulez-vous vraiment annuler cet entretien ?')) {
            try {
                await bookingService.annulerEntretien(id);
                loadEntretiens();
            } catch (err) {
                alert('Erreur lors de l\'annulation');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatutBadge = (statut) => {
        const badges = {
            'DEMANDE': 'bg-yellow-100 text-yellow-800',
            'CONFIRME': 'bg-green-100 text-green-800',
            'ANNULE': 'bg-red-100 text-red-800',
            'TERMINE': 'bg-gray-100 text-gray-800'
        };
        return badges[statut] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-800">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">💬 Mes Entretiens</h1>
                    </div>
                    <button
                        onClick={() => navigate('/entretien/demande')}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        + Demander un entretien
                    </button>
                </div>
            </header>

            {/* Contenu */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
                        {error}
                    </div>
                )}

                {entretiens.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun entretien</h3>
                        <p className="text-gray-600 mb-6">Vous n'avez pas encore d'entretien planifié</p>
                        <button
                            onClick={() => navigate('/entretien/demande')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Demander un entretien
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entretiens.map((entretien) => (
                            <div key={entretien._id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {entretien.objet}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutBadge(entretien.statut)}`}>
                                                {entretien.statut}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p>📅 {formatDate(entretien.creneau?.debut)}</p>
                                            <p>🕐 {formatTime(entretien.creneau?.debut)} - {formatTime(entretien.creneau?.fin)}</p>
                                            <p>👥 Participants: {entretien.participants?.map(p => p.nom).join(', ')}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        {entretien.statut === 'DEMANDE' && (
                                            <>
                                                <button
                                                    onClick={() => handleConfirmer(entretien._id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                                >
                                                    Confirmer
                                                </button>
                                                <button
                                                    onClick={() => handleAnnuler(entretien._id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                                                >
                                                    Annuler
                                                </button>
                                            </>
                                        )}
                                        {entretien.statut === 'CONFIRME' && (
                                            <button
                                                onClick={() => handleAnnuler(entretien._id)}
                                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                                            >
                                                Annuler
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

export default MesEntretiensPage;