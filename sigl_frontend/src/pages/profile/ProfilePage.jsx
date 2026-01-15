import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import ToggleSwitch from '../../components/ToggleSwitch';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    mfaEnabled: false,
    mfaMethod: 'email',
    avatar: null,
  });

  const [initials, setInitials] = useState('?');
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ---------- Chargement du profil ----------
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const user = await authService.getMe();

        if (!user) {
          setError('Impossible de récupérer votre profil.');
          return;
        }

        const prenom = user.prenom || user.firstName || '';
        const nom = user.nom || user.lastName || '';
        const email = user.email || '';
        const telephone = user.telephone || user.phone || '';
        const mfaEnabled = !!user.mfaEnabled;
        const mfaMethod = user.mfaMethod || (telephone ? 'sms' : 'email');
        const avatar = user.avatar || null;

        setFormData({
          prenom,
          nom,
          email,
          telephone,
          mfaEnabled,
          mfaMethod,
          avatar,
        });

        setAvatarPreview(avatar || null);
        updateInitials(prenom, nom, email);
      } catch (err) {
        console.error('Erreur de chargement du profil :', err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Erreur lors du chargement du profil.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateInitials = (prenom, nom, email) => {
    const p = (prenom || '').trim();
    const n = (nom || '').trim();

    if (p || n) {
      setInitials(`${p.charAt(0)}${n.charAt(0)}`.toUpperCase());
    } else if (email) {
      setInitials(email.charAt(0).toUpperCase());
    } else {
      setInitials('?');
    }
  };

  // ---------- Handlers ----------

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'prenom' || name === 'nom') {
      const nextPrenom = name === 'prenom' ? value : formData.prenom;
      const nextNom = name === 'nom' ? value : formData.nom;
      updateInitials(nextPrenom, nextNom, formData.email);
    }

    setError('');
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setAvatarPreview(dataUrl);
      setFormData((prev) => ({
        ...prev,
        avatar: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        prenom: formData.prenom.trim(),
        nom: formData.nom.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim() || null,
        mfaEnabled: formData.mfaEnabled,
        mfaMethod: formData.mfaEnabled ? formData.mfaMethod || 'email' : null,
        avatar:
          typeof formData.avatar === 'string' && formData.avatar.trim().length > 0
            ? formData.avatar.trim()
            : null,
      };

      const updatedUser = await authService.updateProfile(payload);

      if (updatedUser) {
        const prenom = updatedUser.prenom || updatedUser.firstName || payload.prenom;
        const nom = updatedUser.nom || updatedUser.lastName || payload.nom;
        const email = updatedUser.email || payload.email;
        const telephone = updatedUser.telephone || updatedUser.phone || payload.telephone;
        const mfaEnabled = !!updatedUser.mfaEnabled;
        const mfaMethod = updatedUser.mfaMethod || payload.mfaMethod;
        const avatar = updatedUser.avatar || payload.avatar || null;

        setFormData({
          prenom,
          nom,
          email,
          telephone,
          mfaEnabled,
          mfaMethod,
          avatar,
        });
        setAvatarPreview(avatar);
        updateInitials(prenom, nom, email);

        setSuccess('Profil mis à jour avec succès.');
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du profil :', err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Erreur lors de la mise à jour du profil.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Mon profil
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez vos informations personnelles et vos préférences de sécurité.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-semibold overflow-hidden">
                {avatarPreview ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <img
                    src={avatarPreview}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Photo de profil
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Cette photo sera utilisée sur l’ensemble de la plateforme.
                </p>
                <label className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <span>Choisir une image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSaving}
                  />
                </label>
              </div>
            </div>

            {/* Infos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div>
                <label
                  htmlFor="prenom"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Prénom
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>

              {/* Nom */}
              <div>
                <label
                  htmlFor="nom"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={formData.nom}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Cette adresse est utilisée pour vos notifications et la sécurité du compte.
                </p>
              </div>

              {/* Téléphone */}
              <div className="md:col-span-2">
                <label
                  htmlFor="telephone"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Téléphone (pour le MFA SMS)
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Facultatif. Requis si vous choisissez le MFA par SMS.
                </p>
              </div>
            </div>

            {/* Sécurité / MFA */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-800">
                Sécurité du compte
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Authentification multi-facteur (MFA)
                  </p>
                  <p className="text-xs text-gray-500">
                    Ajoutez une couche de sécurité supplémentaire lors de la connexion.
                  </p>
                </div>
                <ToggleSwitch
                  checked={formData.mfaEnabled}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      mfaEnabled: !prev.mfaEnabled,
                    }))
                  }
                  disabled={isSaving}
                />
              </div>

              {formData.mfaEnabled && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Méthode de vérification
                  </label>
                  <select
                    name="mfaMethod"
                    value={formData.mfaMethod}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    className="block w-full md:w-64 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms" disabled={!formData.telephone}>
                      SMS {formData.telephone ? '' : '(ajoutez un téléphone)'}
                    </option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="btn-primary max-w-xs"
                disabled={isSaving}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;