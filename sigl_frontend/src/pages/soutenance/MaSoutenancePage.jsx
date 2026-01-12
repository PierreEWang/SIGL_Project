import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';

const MaSoutenancePage = () => {
    const navigate = useNavigate();
    const [soutenance, setSoutenance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSoutenance();
    }, []);

    const loadSoutenance = async () => {
        try {
            setLoading(true);
            const result = await bookingService.getMaSoutenance();
            if (result.success) {
                setSoutenance(result.data);
            }
        } catch (err) {
            setError('Erreur lors du chargement de la soutenance');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getEtatBadge = (etat) => {
        const badges = {
            'PLANIFIEE': 'bg-blue-100 text-blue-800',
            'VALIDEE': 'bg-green-100 text-green-800',
            'TERMINEE': 'bg-gray-100 text-gray-800',
            'ANNULEE': 'bg-red-100 text-red-800'
        };
        return badges[etat] || 'bg-gray-100 text-gray-800';
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
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-3">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">🎓 Ma Soutenance</h1>
                </div>
            </header>

            {/* Contenu */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
                        {error}
                    </div>
                )}

                {!soutenance ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-6xl mb-4">🎓</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pas de soutenance planifiée</h3>
                        <p className="text-gray-600">
                            Votre soutenance n'a pas encore été planifiée par la coordination.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* En-tête */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Soutenance de fin d'études</h2>
                                    <p className="text-primary-100">
                                        {formatDate(soutenance.dateHeure)}
                                    </p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getEtatBadge(soutenance.etat)}`}>
                                    {soutenance.etat}
                                </span>
                            </div>
                        </div>

                        {/* Détails */}
                        <div className="p-6 space-y-6">
                            {/* Date et lieu */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Date et heure</h3>
                                        <p className="text-gray-600">{formatDate(soutenance.dateHeure)}</p>
                                        <p className="text-gray-500">{formatTime(soutenance.dateHeure)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Salle</h3>
                                        <p className="text-gray-600">{soutenance.salle || 'À définir'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Jury */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">👥 Composition du jury</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {soutenance.jury?.professeurs?.map((prof, index) => (
                                        <div key={prof._id || index} className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                <span className="text-primary-600 font-semibold">
                                                    {prof.nom?.charAt(0) || 'P'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{prof.nom}</p>
                                                <p className="text-xs text-gray-500">{prof.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaSoutenancePage;