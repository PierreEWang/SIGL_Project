import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import journalService from '../../services/journalService';

const CreateJournalPage = () => {
  const navigate = useNavigate();

  // ---------- STATE JOURNAL ----------
  const [periodes, setPeriodes] = useState([
    {
      id: 1,
      titre: '',
      dateDebut: '',
      dateFin: '',
      startTime: '',
      durationHours: '',
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

  // Deadline du journal
  const [deadline, setDeadline] = useState('');

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
    setPeriodes((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, index) => index !== periodeIndex);
    });
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
      prev.map((p, pIndex) => {
        if (pIndex !== periodeIndex) return p;
        if (missionIndex === 0) return p;
        if (p.missions.length <= 1) return p;

        return {
          ...p,
          missions: p.missions.filter((_, mIndex) => mIndex !== missionIndex),
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
          // conservez aussi startTime et durationHours si présents
          startTime: p.startTime || '',
          durationHours: p.durationHours || '',
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

      const payload = {
        periodes: cleanedPeriodes,
        calendarEvent: calendarEvent.enable ? calendarEvent : null,
        deadline: deadline || null,
      };

      const created = await journalService.createJournal(payload);

      // Si ton backend retourne { journal: {...} } ou direct {...}
      const createdId = created?.journal?._id || created?._id || created?.id;

      if (createdId) navigate(`/journal/${createdId}`);
      else navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err?.message || err?.error || 'Erreur lors de la création du journal');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Créer un journal</h1>
              <p className="text-xs text-gray-500">Journal de formation</p>
            </div>
          </div>

          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Retour dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Périodes */}
          {periodes.map((periode, pIndex) => (
            <div key={periode.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Période {pIndex + 1}
                </h2>
                {pIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => removePeriode(pIndex)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Supprimer la période
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={periode.titre}
                    onChange={(e) => handlePeriodeChange(pIndex, 'titre', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Date début
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={periode.dateDebut}
                    onChange={(e) => handlePeriodeChange(pIndex, 'dateDebut', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Date fin
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={periode.dateFin}
                    onChange={(e) => handlePeriodeChange(pIndex, 'dateFin', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Heure début</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={periode.startTime || ''}
                    onChange={(e) => handlePeriodeChange(pIndex, 'startTime', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Durée (heures)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    value={periode.durationHours || ''}
                    onChange={(e) => handlePeriodeChange(pIndex, 'durationHours', e.target.value)}
                  />
                </div>

                <div />
              </div>

              {/* Missions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Missions</h3>

                {(periode.missions || []).map((mission, mIndex) => (
                  <div key={mission.id} className="border border-gray-200 rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Mission {mIndex + 1}
                      </h4>

                      {mIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => removeMission(pIndex, mIndex)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Supprimer la mission
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Intitulé
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={mission.titre}
                          onChange={(e) => handleMissionChange(pIndex, mIndex, 'titre', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Compétences
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={mission.competences}
                          onChange={(e) => handleMissionChange(pIndex, mIndex, 'competences', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3}
                        value={mission.description}
                        onChange={(e) => handleMissionChange(pIndex, mIndex, 'description', e.target.value)}
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

          <button
            type="button"
            onClick={addPeriode}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            + Ajouter une période
          </button>

          {/* Événement calendrier optionnel */}
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
                  onChange={(e) => {
                    const enable = e.target.checked;
                    if (enable) {
                      // pré-remplir depuis la 1ère période si disponible
                      const p = periodes?.[0] || {};
                      setCalendarEvent((prev) => ({
                        ...prev,
                        enable: true,
                        title: prev.title || p.titre || 'Journal de formation',
                        date: prev.date || p.dateDebut || '',
                        time: prev.time || p.startTime || '',
                        notes:
                          prev.notes || (p.durationHours ? `Durée : ${p.durationHours}h` : prev.notes) || '',
                      }));
                    } else {
                      setCalendarEvent((prev) => ({ ...prev, enable: false }));
                    }
                  }}
                />
                <span>Créer un événement lié</span>
              </label>
            </div>

            {calendarEvent.enable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={calendarEvent.title}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={calendarEvent.date}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={calendarEvent.time}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={calendarEvent.location}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={calendarEvent.notes}
                    onChange={(e) =>
                      setCalendarEvent((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Deadline */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Deadline</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date limite de remise (optionnel)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Indiquez une date limite pour la remise de ce journal de formation.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2 rounded-md text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer le journal'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateJournalPage;