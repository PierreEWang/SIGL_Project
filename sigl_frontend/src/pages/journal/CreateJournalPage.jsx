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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // payload compris par le backend (qui va le sérialiser en JSON)
      const payload = {
        periodes,
        status: 'EN_COURS',
        createdAt: new Date().toISOString(),
      };

      await journalService.createJournal(payload);

      // retour au dashboard apprenti
      navigate('/dashboard?tab=journal');
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement du journal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Créer une note mensuelle</h1>

      {error && (
        <div className="mb-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TODO : garde/ajuste ici ton JSX existant pour éditer les périodes & missions,
                  en appelant handlePeriodeChange / handleMissionChange / addPeriode / addMission */}
        {/* ... */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le journal'}
        </button>
      </form>
    </div>
  );
};

export default CreateJournalPage;