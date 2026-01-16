import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import authService from '../../services/authService';

const DemandeEntretienPage = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    const [formData, setFormData] = useState({
        objet: '',
        date: '',
        heureDebut: '',
        heureFin: '',
        participantIds: [currentUser?.id]
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const result = await bookingService.getAvailableContacts();
            if (result.success) {
                const filtered = result.users.filter(u => u._id !== currentUser?.id);
                setAvailableUsers(filtered);
            }
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleParticipantToggle = (userId) => {
        setFormData(prev => {
            const participants = prev.participantIds.includes(userId)
                ? prev.participantIds.filter(id => id !== userId)
                : [...prev.participantIds, userId];
            return { ...prev, participantIds: participants };
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.objet.trim()) newErrors.objet = 'L\'objet est requis';
        if (!formData.date) newErrors.date = 'La date est requise';
        if (!formData.heureDebut) newErrors.heureDebut = 'L\'heure de début est requise';
        if (!formData.heureFin) newErrors.heureFin = 'L\'heure de fin est requise';
        if (formData.heureDebut >= formData.heureFin) {
            newErrors.heureFin = 'L\'heure de fin doit être après l\'heure de début';
        }
        if (formData.participantIds.length < 2) {
            newErrors.participants = 'Sélectionnez au moins un autre participant';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const debut = `${formData.date}T${formData.heureDebut}:00`;
            const fin = `${formData.date}T${formData.heureFin}:00`;

            await bookingService.demanderEntretien(
                formData.objet,
                debut,
                fin,
                formData.participantIds
            );

            alert('Demande d\'entretien envoyée avec succès !');
            navigate('/entretien/mes-entretiens');
        } catch (error) {
            setErrors({ submit: error.response?.data?.error || 'Erreur lors de la demande' });
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        const labels = {
            'TP': 'Tuteur Pédagogique',
            'MA': 'Maître d\'Apprentissage',
            'PROF': 'Professeur',
            'CA': 'Coordinatrice Alternance',
            'RC': 'Responsable Cursus'
        };
        return labels[role] || role;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center space-x-3">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">💬 Demander un Entretien</h1>
                </div>
            </header>

            {/* Formulaire */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Objet */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Objet de l'entretien <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="objet"
                                value={formData.objet}
                                onChange={handleChange}
                                className={`input-field ${errors.objet ? 'border-red-500' : ''}`}
                                placeholder="Ex: Point semestriel, Suivi de projet, Bilan de compétences..."
                            />
                            {errors.objet && <p className="mt-1 text-xs text-red-600">{errors.objet}</p>}
                        </div>

                        {/* Date et heures */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={`input-field ${errors.date ? 'border-red-500' : ''}`}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Heure de début <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="heureDebut"
                                    value={formData.heureDebut}
                                    onChange={handleChange}
                                    className={`input-field ${errors.heureDebut ? 'border-red-500' : ''}`}
                                />
                                {errors.heureDebut && <p className="mt-1 text-xs text-red-600">{errors.heureDebut}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Heure de fin <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="heureFin"
                                    value={formData.heureFin}
                                    onChange={handleChange}
                                    className={`input-field ${errors.heureFin ? 'border-red-500' : ''}`}
                                />
                                {errors.heureFin && <p className="mt-1 text-xs text-red-600">{errors.heureFin}</p>}
                            </div>
                        </div>

                        {/* Participants */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Participants <span className="text-red-500">*</span>
                            </label>
                            {loadingUsers ? (
                                <div className="text-gray-500 text-sm">Chargement des utilisateurs...</div>
                            ) : availableUsers.length === 0 ? (
                                <div className="text-gray-500 text-sm">Aucun tuteur disponible</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {availableUsers.map(user => (
                                        <label
                                            key={user._id}
                                            className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                                                formData.participantIds.includes(user._id)
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.participantIds.includes(user._id)}
                                                onChange={() => handleParticipantToggle(user._id)}
                                                className="w-4 h-4 text-primary-600 mr-3"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-800">{user.nom}</div>
                                                <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {errors.participants && <p className="mt-1 text-xs text-red-600">{errors.participants}</p>}
                        </div>

                        {/* Erreur générale */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                                {errors.submit}
                            </div>
                        )}

                        {/* Boutons */}
                        <div className="flex justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary"
                            >
                                {isLoading ? 'Envoi en cours...' : 'Envoyer la demande'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DemandeEntretienPage;