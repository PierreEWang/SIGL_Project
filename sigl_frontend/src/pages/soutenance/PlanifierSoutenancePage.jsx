import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';

const PlanifierSoutenancePage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        apprentiId: '',
        date: '',
        heure: '',
        salle: '',
        professeurIds: []
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState({ apprentis: [], professeurs: [] });
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const result = await bookingService.getUtilisateurs();
            const allUsers = result.users || [];
            setUsers({
                apprentis: allUsers.filter(u => u.role === 'APPRENTI'),
                professeurs: allUsers.filter(u => u.role === 'PROF')
            });
        } catch (err) {
            console.error('Erreur chargement utilisateurs:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfToggle = (profId) => {
        setFormData(prev => {
            const profs = prev.professeurIds.includes(profId)
                ? prev.professeurIds.filter(id => id !== profId)
                : [...prev.professeurIds, profId];
            return { ...prev, professeurIds: profs };
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.apprentiId) newErrors.apprentiId = 'Sélectionnez un apprenti';
        if (!formData.date) newErrors.date = 'La date est requise';
        if (!formData.heure) newErrors.heure = 'L\'heure est requise';
        if (formData.professeurIds.length < 3) {
            newErrors.professeurs = 'Sélectionnez au moins 3 professeurs (max 5)';
        }
        if (formData.professeurIds.length > 5) {
            newErrors.professeurs = 'Maximum 5 professeurs dans le jury';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const dateHeure = `${formData.date}T${formData.heure}:00`;

            await bookingService.planifierSoutenance(
                formData.apprentiId,
                dateHeure,
                formData.salle,
                formData.professeurIds
            );

            alert('Soutenance planifiée avec succès !');
            navigate('/soutenance/gestion');
        } catch (error) {
            setErrors({ submit: error.response?.data?.error || 'Erreur lors de la planification' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center space-x-3">
                    <button onClick={() => navigate('/soutenance/gestion')} className="text-gray-600 hover:text-gray-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">🎓 Planifier une Soutenance</h1>
                </div>
            </header>

            {/* Formulaire */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Apprenti */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apprenti <span className="text-red-500">*</span>
                            </label>
                            {loadingUsers ? (
                                <div className="text-gray-500">Chargement...</div>
                            ) : (
                                <select
                                    name="apprentiId"
                                    value={formData.apprentiId}
                                    onChange={handleChange}
                                    className={`input-field ${errors.apprentiId ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Sélectionner un apprenti</option>
                                    {users.apprentis.map(a => (
                                        <option key={a._id} value={a._id}>{a.nom} ({a.email})</option>
                                    ))}
                                </select>
                            )}
                            {errors.apprentiId && <p className="mt-1 text-xs text-red-600">{errors.apprentiId}</p>}
                        </div>

                        {/* Date et heure */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    Heure <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="heure"
                                    value={formData.heure}
                                    onChange={handleChange}
                                    className={`input-field ${errors.heure ? 'border-red-500' : ''}`}
                                />
                                {errors.heure && <p className="mt-1 text-xs text-red-600">{errors.heure}</p>}
                            </div>
                        </div>

                        {/* Salle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                            <input
                                type="text"
                                name="salle"
                                value={formData.salle}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ex: Salle A101, Amphithéâtre B..."
                            />
                        </div>

                        {/* Jury */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Composition du jury (3-5 professeurs) <span className="text-red-500">*</span>
                            </label>
                            <p className="text-sm text-gray-500 mb-3">
                                Sélectionnés: {formData.professeurIds.length}/5
                            </p>
                            {loadingUsers ? (
                                <div className="text-gray-500">Chargement...</div>
                            ) : users.professeurs.length === 0 ? (
                                <div className="text-red-500">Aucun professeur disponible</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                    {users.professeurs.map(prof => (
                                        <label
                                            key={prof._id}
                                            className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                                                formData.professeurIds.includes(prof._id)
                                                    ? 'border-primary-500 bg-primary-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.professeurIds.includes(prof._id)}
                                                onChange={() => handleProfToggle(prof._id)}
                                                className="w-4 h-4 text-primary-600 mr-3"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-800">{prof.nom}</div>
                                                <div className="text-xs text-gray-500">{prof.email}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {errors.professeurs && <p className="mt-2 text-xs text-red-600">{errors.professeurs}</p>}
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
                                onClick={() => navigate('/soutenance/gestion')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary"
                            >
                                {isLoading ? 'Planification...' : 'Planifier la soutenance'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PlanifierSoutenancePage;