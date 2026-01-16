import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import entretienPlanificationService from '../../services/entretienPlanificationService';

export default function DetailEntretienPage() {
  const { entretienId } = useParams();
  const navigate = useNavigate();
  
  const [entretien, setEntretien] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    objet: '',
    description: '',
    notes: ''
  });
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showHistorique, setShowHistorique] = useState(false);

  // Charger l'entretien
  useEffect(() => {
    const loadEntretien = async () => {
      try {
        setLoading(true);
        const data = await entretienPlanificationService.getEntretienDetail(entretienId);
        setEntretien(data);
        setFormData({
          objet: data.objet || '',
          description: data.description || '',
          notes: ''
        });
      } catch (err) {
        setError('Impossible de charger l\'entretien');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEntretien();
  }, [entretienId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);
      
      const updates = {};
      if (formData.objet !== entretien.objet) updates.objet = formData.objet;
      if (formData.description !== entretien.description) updates.description = formData.description;
      
      if (Object.keys(updates).length === 0) {
        setSaveError('Aucune modification détectée');
        return;
      }

      const updated = await entretienPlanificationService.mettreAJourEntretien(
        entretienId,
        updates,
        formData.notes
      );
      
      setEntretien(updated);
      setEditMode(false);
      setFormData(prev => ({ ...prev, notes: '' }));
    } catch (err) {
      setSaveError('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      objet: entretien.objet || '',
      description: entretien.description || '',
      notes: ''
    });
    setSaveError(null);
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DEMANDE': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'CONFIRME': return 'bg-green-50 text-green-700 border border-green-200';
      case 'TERMINE': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'ANNULE': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!entretien) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Entretien non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Détails de l'entretien</h1>
          <div className="w-24"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(entretien.statut)}`}>
              {entretien.statut}
            </span>
          </div>

          {/* Contenu principal */}
          {!editMode ? (
            <div className="space-y-6">
              {/* Objet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objet</label>
                <div className="text-lg text-gray-900">{entretien.objet}</div>
              </div>

              {/* Date et Créneau */}
              {entretien.creneau && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Début</label>
                    <div className="text-gray-900">{formatDateTime(entretien.creneau.debut)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fin</label>
                    <div className="text-gray-900">{formatDateTime(entretien.creneau.fin)}</div>
                  </div>
                </div>
              )}

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Participants ({entretien.participants?.length || 0})</label>
                <div className="space-y-2">
                  {entretien.participants?.map((p, i) => (
                    <div key={i} className="bg-gray-50 px-3 py-2 rounded border border-gray-200">
                      <p className="font-medium text-gray-900">{p.nom || 'N/A'} {p.prenom || ''}</p>
                      <p className="text-sm text-gray-600">{p.email}</p>
                      <p className="text-xs text-gray-500">{p.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmations */}
              {entretien.confirmations && entretien.confirmations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmations</label>
                  <div className="space-y-2">
                    {entretien.confirmations.map((conf, i) => (
                      <div key={i} className="bg-gray-50 px-3 py-2 rounded border border-gray-200">
                        <p className="font-medium text-gray-900">{conf.participant?.nom || 'N/A'}</p>
                        <p className={`text-sm ${conf.confirme ? 'text-green-600' : 'text-gray-600'}`}>
                          {conf.confirme ? '✓ Confirmé' : 'En attente'} {conf.dateConfirmation ? `(${formatDateTime(conf.dateConfirmation)})` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 min-h-32 text-gray-900 whitespace-pre-wrap">
                  {entretien.description || '(Aucune description)'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditMode(true)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  ✎ Éditer
                </button>
                <button
                  onClick={() => setShowHistorique(!showHistorique)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
                >
                  📋 {showHistorique ? 'Masquer' : 'Voir'} Historique
                </button>
              </div>
            </div>
          ) : (
            /* Mode édition */
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              {saveError && (
                <div className="rounded-md bg-red-50 p-3 border border-red-200 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Objet</label>
                <input
                  type="text"
                  name="objet"
                  value={formData.objet}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Objet de l'entretien"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Détails de l'entretien"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes de modification</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Correction des détails..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {saveLoading ? 'Sauvegarde...' : '✓ Sauvegarder'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
                >
                  ✗ Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Historique */}
        {showHistorique && entretien.historique && entretien.historique.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Historique des modifications</h2>
            <div className="space-y-4">
              {[...entretien.historique].reverse().map((h, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {h.champ === 'objet' && 'Objet'}
                        {h.champ === 'description' && 'Description'}
                        {h.champ} modifié
                      </p>
                      <p className="text-xs text-gray-600">
                        Par: {h.auteur?.nom || 'Système'} - {new Date(h.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {h.notes && (
                    <p className="text-sm text-gray-700 mb-2 italic">Notes: {h.notes}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Avant:</p>
                      <p className="font-mono text-gray-900 break-words">{h.ancienneValeur || '(vide)'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Après:</p>
                      <p className="font-mono text-gray-900 break-words">{h.nouvelleValeur || '(vide)'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showHistorique && (!entretien.historique || entretien.historique.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
            Aucune modification enregistrée pour cet entretien
          </div>
        )}
      </div>
    </div>
  );
}
