import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import journalService from '../../services/journalService';

const JournalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const journaux = await journalService.getMyJournaux();

        const found =
          journaux.find((j) => String(j.id) === String(id)) ||
          journaux[parseInt(id, 10)];

        if (!found) {
          setError('Journal introuvable.');
        } else {
          setJournal(found);
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement du journal.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  if (isLoading) {
    return <p className="p-4 text-gray-600">Chargement du journal...</p>;
  }

  if (error) {
    return (
      <div className="p-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard?tab=journal')}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 mb-4"
        >
          ← Retour au tableau de bord
        </button>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!journal) {
    return null;
  }

  const periodes = journal.periodes || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard?tab=journal')}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
        >
          ← Retour au tableau de bord
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        Détail du journal de formation
      </h1>

      {periodes.map((p, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Période {idx + 1} {p.titre ? `– ${p.titre}` : ''}
            </h2>
            <span className="text-xs text-gray-500">
              {p.dateDebut && p.dateFin
                ? `${p.dateDebut} → ${p.dateFin}`
                : 'Dates non renseignées'}
            </span>
          </div>

          {(p.missions || []).map((m, mIndex) => (
            <div
              key={mIndex}
              className="border border-gray-100 rounded-md p-3 mb-3"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                {m.titre || `Mission ${mIndex + 1}`}
              </h3>
              {m.competences && (
                <p className="text-xs text-gray-500 mb-1">
                  Compétences : {m.competences}
                </p>
              )}
              {m.description && (
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {m.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}

      {journal.calendarEvent && (
        <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Événement de calendrier lié
          </h2>
          <p className="text-sm text-gray-800">
            <strong>{journal.calendarEvent.title}</strong>
          </p>
          <p className="text-sm text-gray-600">
            {journal.calendarEvent.date}
            {journal.calendarEvent.time ? ` à ${journal.calendarEvent.time}` : ''}
          </p>
          {journal.calendarEvent.location && (
            <p className="text-sm text-gray-600">
              Lieu : {journal.calendarEvent.location}
            </p>
          )}
          {journal.calendarEvent.participantsRaw && (
            <p className="text-sm text-gray-600">
              Participants : {journal.calendarEvent.participantsRaw}
            </p>
          )}
          {journal.calendarEvent.notes && (
            <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
              {journal.calendarEvent.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default JournalDetailPage;