import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import journalService from '../../services/journalService';

const CreateJournalPage = () => {
  const navigate = useNavigate();

  const [periodes, setPeriodes] = useState([
    {
      id: 1,
      titre: '',
      dateDebut: '',
      dateFin: '',
      missions: [
        {
          id: 1,
          titre: '',
          description: '',
          competences: '',
        },
      ],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ------------ Gestion du formulaire ------------

  const handlePeriodeChange = (periodeIndex, field, value) => {
    setPeriodes((prev) =>
      prev.map((p, index) =>
        index === periodeIndex ? { ...p, [field]: value } : p
      )
    );
  };

  const handleMissionChange = (periodeIndex, missionIndex, field, value) => {
    setPeriodes((prev) =>
      prev.map((p, pIndex) => {
        if (pIndex !== periodeIndex) return p;
        return {
          ...p,
          missions: p.missions.map((m, mIndex) =>
            mIndex === missionIndex ? { ...m, [field]: value } : m
          ),
        };
      })
    );
  };

  const addPeriode = () => {
    setPeriodes((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        titre: '',
        dateDebut: '',
        dateFin: '',
        missions: [
          {
            id: 1,
            titre: '',
            description: '',
            competences: '',
          },
        ],
      },
    ]);
  };

  const addMission = (periodeIndex) => {
    setPeriodes((prev) =>
      prev.map((p, index) => {
        if (index !== periodeIndex) return p;
        return {
          ...p,
          missions: [
            ...p.missions,
            {
              id: p.missions.length + 1,
              titre: '',
              description: '',
              competences: '',
            },
          ],
        };
      })
    );
  };

  // Nettoyage des périodes/missions vides
  const sanitizePeriodes = (rawPeriodes) => {
    return rawPeriodes
      .map((p) => {
        const cleanMissions = (p.missions || []).filter((m) => {
          const titre = (m.titre || '').trim();
          const desc = (m.description || '').trim();
          const comp = (m.competences || '').trim();
          return titre || desc || comp;
        });

        return {
          ...p,
          missions: cleanMissions,
        };
      })
      .filter((p) => {
        const hasTitre = (p.titre || '').trim();
        const hasDates = p.dateDebut || p.dateFin;
        const hasMissions = (p.missions || []).length > 0;
        return hasTitre || hasDates || hasMissions;
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const cleanedPeriodes = sanitizePeriodes(periodes);

      if (!cleanedPeriodes.length) {
        setError(
          'Veuillez renseigner au moins une période ou une mission avant de sauvegarder.'
        );
        setIsSubmitting(false);
        return;
      }

      const payload = {
        periodes: cleanedPeriodes,
        status: 'EN_COURS',
        createdAt: new Date().toISOString(),
      };

      await journalService.createJournal(payload);

      navigate('/dashboard?tab=journal');
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement du journal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------ Rendu ------------

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Créer une note mensuelle</h1>

      {error && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {periodes.map((periode, pIndex) => (
          <div
            key={periode.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Période {pIndex + 1}
              </h2>
              <span className="text-xs text-gray-500">
                {periode.dateDebut && periode.dateFin
                  ? `${periode.dateDebut} → ${periode.dateFin}`
                  : 'Dates non renseignées'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intitulé de la période
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex : Missions de novembre"
                  value={periode.titre}
                  onChange={(e) =>
                    handlePeriodeChange(pIndex, 'titre', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={periode.dateDebut}
                  onChange={(e) =>
                    handlePeriodeChange(pIndex, 'dateDebut', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={periode.dateFin}
                  onChange={(e) =>
                    handlePeriodeChange(pIndex, 'dateFin', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Missions / activités ({periode.missions.length})
              </h3>

              {periode.missions.map((mission, mIndex) => (
                <div
                  key={mission.id}
                  className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Titre de la mission
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ex : Développement d'une nouvelle fonctionnalité"
                        value={mission.titre}
                        onChange={(e) =>
                          handleMissionChange(
                            pIndex,
                            mIndex,
                            'titre',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Compétences mobilisées
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ex : C#, travail en équipe..."
                        value={mission.competences}
                        onChange={(e) =>
                          handleMissionChange(
                            pIndex,
                            mIndex,
                            'competences',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description de la mission
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Décrivez ce que vous avez réalisé, les outils utilisés, les résultats..."
                      value={mission.description}
                      onChange={(e) =>
                        handleMissionChange(
                          pIndex,
                          mIndex,
                          'description',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addMission(pIndex)}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100"
              >
                + Ajouter une mission
              </button>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={addPeriode}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            + Ajouter une période
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le journal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJournalPage;