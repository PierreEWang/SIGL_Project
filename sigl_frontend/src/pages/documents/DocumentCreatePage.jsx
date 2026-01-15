import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../../services/documentService';

const FIELD_TYPES = [
  { value: 'text', label: 'Texte' },
  { value: 'textarea', label: 'Zone de texte' },
  { value: 'number', label: 'Nombre' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Liste (select)' },
];

function makeKey(label) {
  return String(label || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export default function DocumentCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const canSave = useMemo(() => title.trim().length >= 2, [title]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        key: '',
        label: '',
        type: 'text',
        required: false,
        options: [],
        optionsText: '',
      },
    ]);
  };

  const updateField = (idx, patch) => {
    setFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...patch } : f))
    );
  };

  const removeField = (idx) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!canSave) return;

    const cleaned = fields
      .filter((f) => String(f.label || '').trim().length > 0)
      .map((f) => {
        const label = String(f.label).trim();
        const key = String(f.key || makeKey(label)).trim() || makeKey(label);

        const base = {
          key,
          label,
          type: f.type,
          required: !!f.required,
          options: [],
        };

        if (f.type === 'select') {
          const opts = String(f.optionsText || '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean);
          base.options = opts;
        }
        return base;
      });

    try {
      setSaving(true);
      const zone = await documentService.createZone({
        title: title.trim(),
        description: description.trim(),
        fields: cleaned,
      });
      navigate(`/documents/${zone._id}`);
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || 'Erreur création zone');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Créer une zone de dépôt</h1>

      {err && <div className="mb-4 text-red-600">{err}</div>}

      <form onSubmit={onSave} className="bg-white border rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Titre *</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Rapport S5, CV, Attestation..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Instructions pour l'apprenti..."
          />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Champs à remplir</h2>
          <button
            type="button"
            onClick={addField}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            + Ajouter un champ
          </button>
        </div>

        {fields.length === 0 && (
          <div className="text-sm text-gray-500">
            Aucun champ (tu peux quand même déposer des fichiers).
          </div>
        )}

        <div className="space-y-4">
          {fields.map((f, idx) => (
            <div key={idx} className="border rounded-xl p-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={f.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    placeholder="Ex: Nom de l'entreprise"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
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

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Clé (optionnel)</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={f.key}
                    onChange={(e) => updateField(idx, { key: e.target.value })}
                    placeholder="Auto si vide (ex: company_name)"
                  />
                </div>

                <div className="flex items-center gap-2 mt-6 md:mt-0">
                  <input
                    type="checkbox"
                    checked={!!f.required}
                    onChange={(e) => updateField(idx, { required: e.target.checked })}
                  />
                  <span className="text-sm">Requis</span>

                  <button
                    type="button"
                    onClick={() => removeField(idx)}
                    className="ml-auto text-sm text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {f.type === 'select' && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Options (séparées par des virgules)
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={f.optionsText || ''}
                    onChange={(e) => updateField(idx, { optionsText: e.target.value })}
                    placeholder="Ex: PDF, DOCX, Autre"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!canSave || saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Création...' : 'Créer la zone'}
          </button>
        </div>
      </form>
    </div>
  );
}