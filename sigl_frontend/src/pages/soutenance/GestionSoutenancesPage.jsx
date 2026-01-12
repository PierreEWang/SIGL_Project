import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';

const GestionSoutenancesPage = () => {
    const navigate = useNavigate();
    const [soutenances, setSoutenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadSoutenances();
    }, []);

    const loadSoutenances = async () => {
        try {
            setLoading(true);
            const result = await bookingService.getAllSoutenances();
            if (result.success) {
                setSoutenances(result.data || []);
            }
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleValider = async (id) => {
        try {
            await bookingService.validerSoutenance(id);
            loadSoutenances();
        } catch (err) {
            alert('Erreur lors de la validation');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
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
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-800">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">🎓 Gestion des Soutenances</h1>
                    </div>
                    <button
                        onClick={() => navigate('/soutenance/planifier')}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        + Planifier une soutenance
                    </button>
                </div>
            </header>

            {/* Contenu */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {soutenances.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-6xl mb-4">🎓</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune soutenance</h3>
                        <p className="text-gray-600 mb-6">Aucune soutenance n'a été planifiée pour le moment</p>
                        <button
                            onClick={() => navigate('/soutenance/planifier')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium"
                        >
                            Planifier une soutenance
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apprenti</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {soutenances.map((soutenance) => (
                                <tr key={soutenance._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{soutenance.apprenti?.nom}</div>
                                        <div className="text-sm text-gray-500">{soutenance.apprenti?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {formatDate(soutenance.dateHeure)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {formatTime(soutenance.dateHeure)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                        {soutenance.salle || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEtatBadge(soutenance.etat)}`}>
                                                {soutenance.etat}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {soutenance.etat === 'PLANIFIEE' && (
                                            <button
                                                onClick={() => handleValider(soutenance._id)}
                                                className="text-green-600 hover:text-green-800 font-medium text-sm"
                                            >
                                                Valider
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionSoutenancesPage;