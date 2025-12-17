import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import journalService from '../../services/journalService';
import calendarService from '../../services/calendarService';

const CreateJournalPage = () => {
  const navigate = useNavigate();

  // ---------- STATE JOURNAL ----------
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

  // ---------- STATE ÉVÉNEMENT CALENDRIER ----------
  const [calendarEvent, setCalendarEvent] = useState({
    enable: false,
    title: '',
    date: '',
    time: '',
    location: '',
    participants: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ---------- HELPERS JOURNAL ----------
  const handlePeriodeChange = (periodeIndex, field, value) => {
    setPeriodes((prev) =>
      prev.map((p, index) => (index === periodeIndex ? { ...p, [field]: value } : p))
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

  const removePeriode = (periodeIndex) => {
    setPeriodes((prev) => prev.filter((_, index) => index !== periodeIndex));
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

  const removeMission = (periodeIndex, missionIndex) => {
    setPeriodes((prev) =>
      prev.map((p, index) => {
        if (index !== periodeIndex) return p;
        return {
          ...p,
          missions: p.missions.filter((_, mIdx) => mIdx !== missionIndex),
        };
      })
    );
  };

  // Nettoyage : retirer les périodes/missions vides
  const sanitizePeriodes = (periodesData) => {
    return periodesData
      .map((p) => {
        const cleanedMissions = p.missions.filter(
          (m) => m.titre.trim() || m.description.trim() || m.competences.trim()
        );
        const hasTitre = !!p.titre.trim();
        const hasDates = !!p.dateDebut || !!p.dateFin;
        const hasMissions = cleanedMissions.length > 0;

        if (!hasTitre && !hasDates && !hasMissions) {
          return null;
        }

        return {
          ...p,
          missions: cleanedMissions,
        };
      })
      .filter(Boolean);
  };

  const validateData = () => {
    const cleanedPeriodes = sanitizePeriodes(periodes);
    return cleanedPeriodes.length > 0;
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const cleanedPeriodes = sanitizePeriodes(periodes);

      if (!cleanedPeriodes.length) {
        setError('Veuillez renseigner au moins une période ou une mission avant de sauvegarder.');
        setIsSubmitting(false);
        return;
      }

      // Construction du payload journal
      const payload = {
        periodes: cleanedPeriodes,
        status: 'ENCOURS',
        createdAt: new Date().toISOString(),
      };

      // Créer le journal d'abord
      const journalResponse = await journalService.createJournal(payload);

      // Si l'événement calendrier est activé, le créer
      if (calendarEvent.enable && calendarEvent.title.trim() && calendarEvent.date) {
        try {
          await calendarService.createEvent({
            title: calendarEvent.title.trim(),
            description: calendarEvent.notes || '',
            date: calendarEvent.date,
            time: calendarEvent.time || null,
            location: calendarEvent.location || null,
            category: 'formation',
            journalId: journalResponse?.id || null,
          });
        } catch (calError) {
          console.error('Erreur lors de la création de l\'événement calendrier:', calError);
          // Ne pas bloquer si l'événement échoue
        }
      }

      navigate('/dashboard?tab=journal');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de l\'enregistrement du journal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- RENDU ----------
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Lien retour */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard?tab=journal')}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
        >
          ← Retour au tableau de bord
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Créer une note mensuelle</h1>

      {error && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Périodes */}
        {periodes.map((periode, pIndex) => (
          <div
            key={periode.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Période {pIndex + 1}</h2>
                <span className="text-xs text-gray-500">
                  {periode.dateDebut && periode.dateFin
                    ? `${periode.dateDebut} → ${periode.dateFin}`
                    : 'Dates non renseignées'}
                </span>
              </div>
              {periodes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePeriode(pIndex)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Supprimer la période
                </button>
              )}
            </div>

            {/* Champs de la période */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intitulé de la période
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Missions de novembre"
                  value={periode.titre}
                  onChange={(e) => handlePeriodeChange(pIndex, 'titre', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={periode.dateDebut}
                  onChange={(e) => handlePeriodeChange(pIndex, 'dateDebut', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={periode.dateFin}
                  onChange={(e) => handlePeriodeChange(pIndex, 'dateFin', e.target.value)}
                />
              </div>
            </div>

            {/* Missions */}
            <div className="space-y-4">
              {periode.missions.map((mission, mIndex) => (
                <div key={mission.id} className="border border-gray-200 rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700">Mission {mIndex + 1}</h3>
                    {mIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => removeMission(pIndex, mIndex)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Titre de la mission
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: Développement d'une API REST"
                      value={mission.titre}
                      onChange={(e) =>
                        handleMissionChange(pIndex, mIndex, 'titre', e.target.value)
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
                      placeholder="Ex: Node.js, MongoDB, Express"
                      value={mission.competences}
                      onChange={(e) =>
                        handleMissionChange(pIndex, mIndex, 'competences', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description de la mission
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows="3"
                      placeholder="Décrivez ce que vous avez réalisé, les outils utilisés, les résultats."
                      value={mission.description}
                      onChange={(e) =>
                        handleMissionChange(pIndex, mIndex, 'description', e.target.value)
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

        {/* Section événement calendrier */}
        <div className="bg-white rounded-lg shadow border border-primary-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Lier un événement de calendrier (optionnel)
            </h2>
            <label className="inline-flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={calendarEvent.enable}
                onChange={(e) =>
                  setCalendarEvent((prev) => ({ ...prev, enable: e.target.checked }))
                }
              />
              <span>Créer un événement lié à ce journal</span>
            </label>
          </div>

          {calendarEvent.enable && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de l'événement
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Entretien semestriel"
                    value={calendarEvent.title}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={calendarEvent.date}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={calendarEvent.time}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({ ...prev, time: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: ESEO Angers, Salle de soutenance 2"
                    value={calendarEvent.location}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({ ...prev, location: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / ordre du jour (optionnel)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Ex: Préparer le bilan semestriel, les objectifs à venir, etc."
                  value={calendarEvent.notes}
                  onChange={(e) =>
                    setCalendarEvent((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={addPeriode}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            + Ajouter une période
          </button>

          <div className="space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard?tab=journal')}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le journal'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateJournalPage;