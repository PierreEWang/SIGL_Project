// sigl_frontend/src/pages/documents/DocumentsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import documentsService from '../../services/documentService';

// ❌ IMPORTANT: on enlève le Header public (sinon double header dans le dashboard)
// import Header from '../../components/Header';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
];

export default function DocumentsPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allowAttachments, setAllowAttachments] = useState(true);
  const [fields, setFields] = useState([
    { key: '', label: '', type: 'textarea', required: false, optionsText: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const canCreate = useMemo(() => {
    const okTitle = title.trim().length >= 2;
    const okField = fields.some((f) => String(f.label || '').trim().length > 0);
    return okTitle && okField;
  }, [title, fields]);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await documentsService.listZones();
      setZones(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Erreur chargement zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetCreate = () => {
    setCreateOpen(false);
    setTitle('');
    setDescription('');
    setAllowAttachments(true);
    setFields([{ key: '', label: '', type: 'textarea', required: false, optionsText: '' }]);
    setErr('');
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { key: '', label: '', type: 'textarea', required: false, optionsText: '' },
    ]);
  };

  const updateField = (idx, patch) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const removeField = (idx) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setErr('');

    if (!canCreate) return;

    const cleaned = fields
      .filter((f) => String(f.label || '').trim().length > 0)
      .map((f) => {
        const label = String(f.label).trim();
        const key =
          String(f.key || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '') || label.toLowerCase().replace(/\s+/g, '_');

        const base = {
          key,
          label,
          type: f.type || 'text',
          required: !!f.required,
          options: [],
        };

        if (f.type === 'select') {
          base.options = String(f.optionsText || '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean);
        }

        return base;
      });

    try {
      setSaving(true);
      await documentsService.createZone({
        title: title.trim(),
        description: description.trim(),
        allowAttachments: !!allowAttachments,
        fields: cleaned,
      });
      resetCreate();
      await load();
    } catch (e2) {
      // ✅ affiche enfin le message back (pas juste "status code 400")
      setErr(e2?.response?.data?.message || e2?.message || 'Erreur création zone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* ❌ on ne rend plus le Header public ici */}

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="mb-2">
            <Link to="/dashboard" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800">
              ← Retour au tableau de bord
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">Mes documents</h1>
          <p className="text-sm text-gray-600 mt-1">Zones de dépôt & pièces jointes</p>
        </div>

        <button
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
          onClick={() => setCreateOpen(true)}
        >
          + Nouvelle zone
        </button>
      </div>

      {err && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {err}
        </div>
      )}

      {createOpen && (
        <form onSubmit={onCreate} className="bg-white border rounded-2xl p-6 mb-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Créer une zone de dépôt</h2>
            <button type="button" className="text-sm text-gray-500 hover:underline" onClick={resetCreate}>
              Fermer
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Titre</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Rapport S5, CV, etc."
              />
            </div>

            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={allowAttachments}
                onChange={(e) => setAllowAttachments(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Autoriser les pièces jointes</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Champs à remplir</div>
              <button type="button" className="text-sm text-blue-600 hover:underline" onClick={addField}>
                + Ajouter un champ
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((f, idx) => (
                <div key={idx} className="grid md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-3">
                    <label className="text-xs text-gray-600">Key</label>
                    <input
                      className="mt-1 w-full border rounded-lg px-2 py-2"
                      value={f.key}
                      onChange={(e) => updateField(idx, { key: e.target.value })}
                      placeholder="ex: commentaire"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-xs text-gray-600">Label</label>
                    <input
                      className="mt-1 w-full border rounded-lg px-2 py-2"
                      value={f.label}
                      onChange={(e) => updateField(idx, { label: e.target.value })}
                      placeholder="Texte affiché"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-xs text-gray-600">Type</label>
                    <select
                      className="mt-1 w-full border rounded-lg px-2 py-2"
                      value={f.type}
                      onChange={(e) => updateField(idx, { type: e.target.value })}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!f.required}
                      onChange={(e) => updateField(idx, { required: e.target.checked })}
                    />
                    <span className="text-sm">Requis</span>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-gray-500 hover:underline"
                      onClick={() => removeField(idx)}
                      disabled={fields.length <= 1}
                      title={fields.length <= 1 ? 'Au moins 1 champ' : 'Supprimer'}
                    >
                      Suppr.
                    </button>
                  </div>

                  {f.type === 'select' && (
                    <div className="md:col-span-12">
                      <label className="text-xs text-gray-600">Options (séparées par des virgules)</label>
                      <input
                        className="mt-1 w-full border rounded-lg px-2 py-2"
                        value={f.optionsText || ''}
                        onChange={(e) => updateField(idx, { optionsText: e.target.value })}
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100" onClick={resetCreate}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canCreate || saving}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {saving ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-semibold">Mes zones</div>
            <div className="text-sm text-gray-500">Clique une zone pour déposer des documents.</div>
          </div>
          <button className="text-sm text-blue-600 hover:underline" onClick={load}>
            Rafraîchir
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Chargement…</div>
        ) : zones.length === 0 ? (
          <div className="text-gray-500">Aucune zone de dépôt pour le moment.</div>
        ) : (
          <div className="divide-y">
            {zones.map((z) => (
              <Link
                key={z._id}
                to={`/documents/${z._id}`}
                className="block py-3 hover:bg-gray-50 px-2 rounded-lg"
              >
                <div className="font-medium">{z.title}</div>
                <div className="text-sm text-gray-500">{z.description || '—'}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}