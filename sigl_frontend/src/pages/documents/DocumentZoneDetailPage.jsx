import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams,useNavigate } from 'react-router-dom';
import documentService from '../../services/documentService';

export default function DocumentZoneDetailPage() {
  const { zoneId } = useParams();

  const [zone, setZone] = useState(null);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const [values, setValues] = useState({});
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fields = useMemo(() => zone?.fieldsSnapshot || [], [zone]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await documentService.getZone(zoneId);
      setZone(data?.zone || null);
      setLastSubmission(data?.lastSubmission || null);

      // init values
      const init = {};
      for (const f of (data?.zone?.fieldsSnapshot || [])) init[f.key] = '';
      // si déjà soumis, on préremplit depuis lastSubmission
      const prev = data?.lastSubmission?.values || null;
      setValues(prev ? { ...init, ...prev } : init);
    } catch (e) {
      setErr(extractApiError(e) || 'Impossible de charger la zone.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  const submit = async () => {
    setErr(null);
    setSubmitting(true);
    try {
      const created = await documentService.submitToZone(zoneId, values, files);
      setLastSubmission(created);
      setFiles([]);
      await load();
    } catch (e) {
      setErr(extractApiError(e) || 'Erreur lors de l’envoi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Chargement…</div>;
  if (!zone) return <div className="text-sm text-gray-500">Zone introuvable.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">
            <Link to="/dashboard" className="hover:underline">Retour au tableau de bord</Link>
            <span className="mx-2">/</span>
            <Link to="/documents" className="hover:underline">Documents</Link>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">{zone.title}</h2>
          {zone.description && <p className="text-sm text-gray-600 mt-1">{zone.description}</p>}
        </div>
        <button className="btn-secondary" type="button" onClick={load}>
          Rafraîchir
        </button>
      </div>

      {err && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {String(err)}
        </div>
      )}

      {/* Dernier dépôt */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Dernier dépôt</h3>
        {!lastSubmission ? (
          <p className="text-sm text-gray-500 mt-2">Aucun dépôt pour le moment.</p>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="text-sm text-gray-600">
              Déposé le :{' '}
              <span className="font-medium">
                {new Date(lastSubmission.createdAt).toLocaleString()}
              </span>
            </div>

            {/* fichiers */}
            {(lastSubmission.files || []).length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-semibold text-gray-800">Fichiers</div>
                <ul className="mt-2 space-y-2">
                  {lastSubmission.files.map((f) => (
                    <li key={f.storageName} className="flex items-center justify-between gap-3">
                      <div className="text-sm text-gray-700">
                        {f.originalName}{' '}
                        <span className="text-gray-400 text-xs">
                          ({Math.round((f.size || 0) / 1024)} Ko)
                        </span>
                      </div>
                      <a
                        className="text-sm text-primary-700 hover:underline"
                        href={documentService.fileDownloadUrl(f.storageName)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Télécharger
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Formulaire */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Remplir et déposer</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {f.label} {f.required && <span className="text-red-600">*</span>}
              </label>

              {f.type === 'textarea' ? (
                <textarea
                  className="input-field min-h-[110px]"
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              ) : (
                <input
                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                  className="input-field"
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="text-sm font-semibold text-gray-800">Pièces jointes</div>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          {files.length > 0 && (
            <div className="text-sm text-gray-600">
              {files.length} fichier(s) sélectionné(s)
            </div>
          )}
          <div className="text-xs text-gray-400">Max 10 fichiers (backend).</div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="btn-secondary" type="button" onClick={() => setFiles([])}>
            Vider fichiers
          </button>
          <button className="btn-primary" type="button" onClick={submit} disabled={submitting}>
            {submitting ? 'Envoi…' : 'Déposer'}
          </button>
        </div>
      </section>
    </div>
  );
}

function extractApiError(err) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    null
  );
}