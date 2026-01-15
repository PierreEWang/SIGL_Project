import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import documentsService from '../../services/documentService';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [zone, setZone] = useState(null);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [values, setValues] = useState({});
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const fields = useMemo(() => zone?.fieldsSnapshot ?? [], [zone]);

  const load = async () => {
    try {
      setErr('');
      const data = await documentsService.getZone(id);
      const z = data?.zone ?? data; // support both shapes just in case
      setZone(z ?? null);
      setLastSubmission(data?.lastSubmission ?? null);

      // init values
      const init = {};
      (z?.fieldsSnapshot ?? []).forEach((f) => {
        init[f.key] = '';
      });

      setValues(init);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || e?.message || 'Erreur chargement zone');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChangeValue = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');

    try {
      const submission = await documentsService.submitToZone(id, { values, files });
      // recharge pour récupérer la "lastSubmission" actualisée
      await load();
      setFiles([]);
    } catch (e2) {
      console.error(e2);
      setErr(e2?.response?.data?.error || e2?.message || 'Erreur soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (f) => {
    try {
      setErr('');
      const blob = await documentsService.downloadFile(f.storageName);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = f.originalName || f.storageName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.error || e?.message || 'Erreur téléchargement fichier');
    }
  };

  if (!zone) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-red-700">{err || 'Zone introuvable'}</div>

        <div className="flex gap-4 mt-3">
          <Link className="text-blue-600 hover:underline" to="/dashboard">
            ← Retour au tableau de bord
          </Link>
          <Link className="text-blue-600 hover:underline" to="/documents">
            ← Retour aux documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex gap-4 mb-4">
        <Link className="text-blue-600 hover:underline" to="/dashboard">
          ← Retour au tableau de bord
        </Link>
        <Link className="text-blue-600 hover:underline" to="/documents">
          ← Retour aux documents
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{zone.title}</h1>
          {zone.description && (
            <p className="text-gray-600 mt-1">{zone.description}</p>
          )}
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {err}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Champs à remplir</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}{f.required ? ' *' : ''}
              </label>

              {f.type === 'textarea' ? (
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                  value={values[f.key] ?? ''}
                  onChange={(e) => onChangeValue(f.key, e.target.value)}
                  required={!!f.required}
                />
              ) : (
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                  value={values[f.key] ?? ''}
                  onChange={(e) => onChangeValue(f.key, e.target.value)}
                  required={!!f.required}
                />
              )}
            </div>
          ))}
        </div>

        {zone.allowAttachments && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Pièces jointes</h3>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            {files.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {files.length} fichier(s) sélectionné(s)
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {submitting ? 'Envoi...' : 'Soumettre'}
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold mb-4">Dernière soumission</h2>

        {!lastSubmission ? (
          <p className="text-gray-600">Aucune soumission pour le moment.</p>
        ) : (
          <>
            <p className="text-gray-700">
              {new Date(lastSubmission.createdAt).toLocaleString('fr-FR')}
            </p>

            <div className="mt-3">
              <div className="font-medium mb-1">Fichiers</div>
              {(lastSubmission.files || []).length === 0 ? (
                <p className="text-gray-600">Aucun fichier</p>
              ) : (
                <ul className="list-disc list-inside">
                  {lastSubmission.files.map((f) => (
                    <li key={f.storageName}>
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => handleDownload(f)}
                      >
                        {f.originalName || f.storageName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}