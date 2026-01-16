import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import journalService from '../../services/journalService';

const JournalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const journalData = await journalService.getJournalById(id);

        if (!journalData) {
          setError('Journal introuvable.');
        } else {
          setJournal(journalData);
          setEditContent(journalData.contenu || '');
          let parsed = {};
          try {
            parsed = JSON.parse(journalData.contenu || '{}');
          } catch (e) {}
          setEditStatus(parsed.status || 'EN_COURS');
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedJournal = await journalService.updateJournal(id, { contenu: editContent });
      setJournal(updatedJournal);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde du journal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce journal ?')) return;

    try {
      await journalService.deleteJournal(id);
      navigate('/dashboard?tab=journal');
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression du journal.");
    }
  };

  const handleCancel = () => {
    setEditContent(journal.contenu || '');
    let parsed = {};
    try {
      parsed = JSON.parse(journal.contenu || '{}');
    } catch (e) {}
    setEditStatus(parsed.status || 'EN_COURS');
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(journal.contenu || '{}');
      } catch (e) {}
      parsed.status = newStatus;
      const newContent = JSON.stringify(parsed);
      await journalService.updateJournal(id, { contenu: newContent });
      setJournal({ ...journal, contenu: newContent, status: newStatus });
      setEditStatus(newStatus);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour du statut.");
    }
  };

  let parsedContent = {};
  try {
    parsedContent = JSON.parse(journal.contenu || '{}');
  } catch (e) {
    parsedContent = { periodes: [], status: 'EN_COURS' };
  }

  const periodes = parsedContent.periodes || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate('/dashboard?tab=journal')}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
        >
          ← Retour au tableau de bord
        </button>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                {showHistory ? 'Masquer' : 'Voir'} Historique
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Statut du journal</label>
        <select
          value={editStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="A_VENIR">À venir</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminé</option>
        </select>
      </div>

      {journal?.deadline && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded">
          <p className="text-sm font-medium text-orange-900">
            📅 Deadline: {new Date(journal.deadline).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </p>
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-4">
        Détail du journal de formation
      </h1>

      {isEditing ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu du journal
          </label>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez le contenu de votre journal..."
          />
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Contenu</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-line">
            {journal.contenu || 'Aucun contenu'}
          </div>
        </div>
      )}

      {showHistory && journal.history && journal.history.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Historique des modifications</h2>
          <div className="space-y-2">
            {journal.history.map((entry, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  Modifié le {new Date(entry.timestamp).toLocaleString()}
                </div>
                <div className="mt-2 text-sm whitespace-pre-line">
                  {entry.contenu}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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