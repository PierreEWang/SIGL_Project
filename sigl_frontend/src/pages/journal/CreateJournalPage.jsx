import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const CreateJournalPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [periodes, setPeriodes] = useState([
    {
      id: 1,
      dateDebut: '',
      dateFin: '',
      missions: [
        {
          id: 1,
          titre: '',
          description: '',
          competences: []
        }
      ]
    }
  ]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const competencesList = [
    'Produire',
    'Valider',
    'S\'adapter',
    'Communiquer',
    'Diagnostiquer',
    'Concevoir',
    'Piloter'
  ];

  // Ajouter une nouvelle période
  const handleAddPeriode = () => {
    const newPeriode = {
      id: periodes.length + 1,
      dateDebut: '',
      dateFin: '',
      missions: [
        {
          id: 1,
          titre: '',
          description: '',
          competences: []
        }
      ]
    };
    setPeriodes([...periodes, newPeriode]);
  };

  // Supprimer une période
  const handleRemovePeriode = (periodeId) => {
    if (periodes.length > 1) {
      setPeriodes(periodes.filter(p => p.id !== periodeId));
    }
  };

  // Ajouter une mission à une période
  const handleAddMission = (periodeId) => {
    setPeriodes(periodes.map(periode => {
      if (periode.id === periodeId) {
        const newMission = {
          id: periode.missions.length + 1,
          titre: '',
          description: '',
          competences: []
        };
        return {
          ...periode,
          missions: [...periode.missions, newMission]
        };
      }
      return periode;
    }));
  };

  // Supprimer une mission
  const handleRemoveMission = (periodeId, missionId) => {
    setPeriodes(periodes.map(periode => {
      if (periode.id === periodeId && periode.missions.length > 1) {
        return {
          ...periode,
          missions: periode.missions.filter(m => m.id !== missionId)
        };
      }
      return periode;
    }));
  };

  // Mettre à jour les dates d'une période
  const handlePeriodeChange = (periodeId, field, value) => {
    setPeriodes(periodes.map(periode => {
      if (periode.id === periodeId) {
        return { ...periode, [field]: value };
      }
      return periode;
    }));
  };

  // Mettre à jour une mission
  const handleMissionChange = (periodeId, missionId, field, value) => {
    setPeriodes(periodes.map(periode => {
      if (periode.id === periodeId) {
        return {
          ...periode,
          missions: periode.missions.map(mission => {
            if (mission.id === missionId) {
              return { ...mission, [field]: value };
            }
            return mission;
          })
        };
      }
      return periode;
    }));
  };

  // Gérer la sélection des compétences
  const handleCompetenceToggle = (periodeId, missionId, competence) => {
    setPeriodes(periodes.map(periode => {
      if (periode.id === periodeId) {
        return {
          ...periode,
          missions: periode.missions.map(mission => {
            if (mission.id === missionId) {
              const competences = mission.competences.includes(competence)
                ? mission.competences.filter(c => c !== competence)
                : [...mission.competences, competence];
              return { ...mission, competences };
            }
            return mission;
          })
        };
      }
      return periode;
    }));
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};
    
    periodes.forEach((periode, pIndex) => {
      if (!periode.dateDebut) {
        newErrors[`periode_${periode.id}_dateDebut`] = 'La date de début est requise';
      }
      if (!periode.dateFin) {
        newErrors[`periode_${periode.id}_dateFin`] = 'La date de fin est requise';
      }
      if (periode.dateDebut && periode.dateFin && periode.dateDebut > periode.dateFin) {
        newErrors[`periode_${periode.id}_dates`] = 'La date de fin doit être après la date de début';
      }

      periode.missions.forEach((mission, mIndex) => {
        if (!mission.titre.trim()) {
          newErrors[`mission_${periode.id}_${mission.id}_titre`] = 'Le titre de la mission est requis';
        }
        if (!mission.description.trim()) {
          newErrors[`mission_${periode.id}_${mission.id}_description`] = 'La description est requise';
        }
        if (mission.competences.length === 0) {
          newErrors[`mission_${periode.id}_${mission.id}_competences`] = 'Sélectionnez au moins une compétence';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsLoading(true);

  try {
    // Créer l'objet journal
    const journal = {
      id: Date.now().toString(), // ID temporaire
      periodes: periodes,
      status: 'en_cours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser?._id
    };

    // Sauvegarder dans localStorage (temporaire)
    const existingJournaux = localStorage.getItem('journaux');
    const journaux = existingJournaux ? JSON.parse(existingJournaux) : [];
    journaux.push(journal);
    localStorage.setItem('journaux', JSON.stringify(journaux));

    console.log('✅ Journal sauvegardé:', journal);

    // TODO: Remplacer par un vrai appel API
    // await api.post('/api/journaux', journal);

    alert('Journal de formation enregistré avec succès !');
    navigate('/dashboard');

  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    setErrors({ submit: 'Une erreur est survenue lors de la sauvegarde' });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800">📔 Journal de Formation</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Renseignez vos activités mensuelles
          </h2>
          <p className="text-gray-600">
            Consultez l'historique de votre formation et ajoutez vos nouvelles activités par période.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Périodes */}
          {periodes.map((periode, periodeIndex) => (
            <div key={periode.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header de la période */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">PERIODE {periode.id}</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {currentUser?.firstName} {currentUser?.lastName} - Étudiant
                  </p>
                </div>
                {periodes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePeriode(periode.id)}
                    className="text-white hover:text-red-200 transition"
                    title="Supprimer cette période"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="p-6 space-y-6">
                
                {/* Dates de la période */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date/Période <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="date"
                        value={periode.dateDebut}
                        onChange={(e) => handlePeriodeChange(periode.id, 'dateDebut', e.target.value)}
                        className={`input-field ${errors[`periode_${periode.id}_dateDebut`] ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {errors[`periode_${periode.id}_dateDebut`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`periode_${periode.id}_dateDebut`]}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="date"
                        value={periode.dateFin}
                        onChange={(e) => handlePeriodeChange(periode.id, 'dateFin', e.target.value)}
                        className={`input-field ${errors[`periode_${periode.id}_dateFin`] ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                      />
                      {errors[`periode_${periode.id}_dateFin`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`periode_${periode.id}_dateFin`]}</p>
                      )}
                    </div>
                  </div>
                  {errors[`periode_${periode.id}_dates`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`periode_${periode.id}_dates`]}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {periode.dateDebut && periode.dateFin && (
                      `${periode.dateDebut} - ${periode.dateFin}`
                    )}
                  </p>
                </div>

                {/* Missions */}
                {periode.missions.map((mission, missionIndex) => (
                  <div key={mission.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-800">Mission {missionIndex + 1}</h4>
                      {periode.missions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMission(periode.id, mission.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>

                    {/* Titre de la mission */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre de la mission <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={mission.titre}
                        onChange={(e) => handleMissionChange(periode.id, mission.id, 'titre', e.target.value)}
                        className={`input-field ${errors[`mission_${periode.id}_${mission.id}_titre`] ? 'border-red-500' : ''}`}
                        placeholder="Ex: Formation et documentation sur les systèmes de supervision"
                        disabled={isLoading}
                      />
                      {errors[`mission_${periode.id}_${mission.id}_titre`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`mission_${periode.id}_${mission.id}_titre`]}</p>
                      )}
                    </div>

                    {/* Tâches réalisées */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tâches réalisées <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={mission.description}
                        onChange={(e) => handleMissionChange(periode.id, mission.id, 'description', e.target.value)}
                        className={`input-field min-h-[120px] ${errors[`mission_${periode.id}_${mission.id}_description`] ? 'border-red-500' : ''}`}
                        placeholder="Décrivez en détail les tâches réalisées pendant cette mission..."
                        disabled={isLoading}
                      />
                      {errors[`mission_${periode.id}_${mission.id}_description`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`mission_${periode.id}_${mission.id}_description`]}</p>
                      )}
                    </div>

                    {/* Compétences */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compétences mises en œuvre <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {competencesList.map((competence) => (
                          <label
                            key={competence}
                            className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                              mission.competences.includes(competence)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={mission.competences.includes(competence)}
                              onChange={() => handleCompetenceToggle(periode.id, mission.id, competence)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              disabled={isLoading}
                            />
                            <span className="text-sm font-medium text-gray-700">{competence}</span>
                          </label>
                        ))}
                      </div>
                      {errors[`mission_${periode.id}_${mission.id}_competences`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`mission_${periode.id}_${mission.id}_competences`]}</p>
                      )}
                    </div>

                  </div>
                ))}

                {/* Bouton Ajouter mission */}
                <button
                  type="button"
                  onClick={() => handleAddMission(periode.id)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition font-medium"
                  disabled={isLoading}
                >
                  + Ajouter une mission
                </button>

              </div>
            </div>
          ))}

          {/* Bouton Ajouter période */}
          <button
            type="button"
            onClick={handleAddPeriode}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition shadow-md"
            disabled={isLoading}
          >
            + Ajouter une période
          </button>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md"
              disabled={isLoading}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer le journal'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateJournalPage;
