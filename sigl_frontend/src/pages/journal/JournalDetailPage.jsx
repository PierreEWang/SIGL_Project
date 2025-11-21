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

        // On réutilise la route GET /api/journaux
        const journaux = await journalService.getMyJournaux();

        const found =
          journaux.find((j) => j.id === id) ||
          journaux[parseInt(id, 10)] || // fallback si jamais l'id était un index
          null;

        if (!found) {
          setError('Journal introuvable.');
        } else {
          setJournal(found);
        }
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement du journal.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-gray-600">Chargement du journal...</p>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <p className="text-red-600 text-sm">{error || 'Journal introuvable.'}</p>
        <button
          onClick={() => navigate('/dashboard?tab=journal')}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
        >
          ← Retour au journal de formation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Détail de la note mensuelle
          </h1>
          <p className="text-sm text-gray-500">
            Créée le {formatDate(journal.createdAt)}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard?tab=journal')}
          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          ← Retour au journal
        </button>
      </div>

      {journal.periodes?.length ? (
        <div className="space-y-6">
          {journal.periodes.map((periode, pIndex) => (
            <div
              key={periode.id || pIndex}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Période {pIndex + 1}{' '}
                  {periode.titre ? `- ${periode.titre}` : ''}
                </h2>
                <span className="text-xs text-gray-500">
                  {periode.dateDebut && periode.dateFin
                    ? `${periode.dateDebut} → ${periode.dateFin}`
                    : ''}
                </span>
              </div>

              {periode.missions?.length ? (
                <div className="space-y-3">
                  {periode.missions.map((mission, mIndex) => (
                    <div
                      key={mission.id || mIndex}
                      className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-2"
                    >
                      <h3 className="text-sm font-semibold text-gray-800">
                        Mission {mIndex + 1}{' '}
                        {mission.titre ? `- ${mission.titre}` : ''}
                      </h3>
                      {mission.competences && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Compétences : </span>
                          {mission.competences}
                        </p>
                      )}
                      {mission.description && (
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {mission.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucune mission renseignée pour cette période.
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aucune période renseignée.</p>
      )}
    </div>
  );
};

export default JournalDetailPage;