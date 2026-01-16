import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const ROLE_OPTIONS = [
  { value: 'APPRENTI', label: 'Apprenti' },
  { value: 'MA', label: 'Maitre Apprentissage' },
  { value: 'TP', label: 'Tuteur Pédagogique' },
  { value: 'CA', label: 'Coordinateur Apprentissage' },
  { value: 'RC', label: 'Responsable Campus' },
  { value: 'PROF', label: 'Professeur' },
];

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Champs obligatoires
    nom: '',
    prenom: '',
    dateNaissance: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    // Champ optionnel
    codePostal: '',
    role: 'APPRENTI',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation champ par champ
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'nom':
      case 'prenom':
        if (!value.trim()) {
          error = 'Ce champ est requis';
        } else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) {
          error = 'Uniquement des lettres, espaces et tirets autorisés';
        } else if (value.length < 2) {
          error = 'Minimum 2 caractères';
        }
        break;

      case 'dateNaissance': {
        if (!value) {
          error = 'La date de naissance est requise';
        } else {
          const date = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - date.getFullYear();

          if (isNaN(date.getTime())) {
            error = 'Date invalide';
          } else if (age < 16) {
            error = 'Vous devez avoir au moins 16 ans';
          } else if (age > 100) {
            error = 'Date de naissance non valide';
          }
        }
        break;
      }

      case 'telephone':
        if (!value.trim()) {
          error = 'Le numéro de téléphone est requis';
        } else if (!/^0\d{9}$/.test(value)) {
          error = 'Le numéro doit contenir 10 chiffres et commencer par 0';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Format d'email invalide (doit contenir @)";
        } else if (!value.endsWith('@reseau.eseo.fr')) {
          error = "L'email doit se terminer par @reseau.eseo.fr";
        }
        break;

      case 'codePostal':
        if (value.trim() && !/^\d{5}$/.test(value)) {
          error = 'Le code postal doit contenir exactement 5 chiffres';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Le mot de passe est requis';
        } else if (value.length < 8) {
          error = 'Minimum 8 caractères';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Au moins une majuscule requise';
        } else if (!/[a-z]/.test(value)) {
          error = 'Au moins une minuscule requise';
        } else if (!/[0-9]/.test(value)) {
          error = 'Au moins un chiffre requis';
        } else if (!/[!@#$%^&*]/.test(value)) {
          error = 'Au moins un caractère spécial requis (!@#$%^&*)';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Veuillez confirmer votre mot de passe';
        } else if (value !== formData.password) {
          error = 'Les mots de passe ne correspondent pas';
        }
        break;

      case 'role':
        if (!value) {
          error = 'Le rôle est requis';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === 'telephone') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    if (name === 'codePostal') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    const error = validateField(name, formattedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    if (name === 'password' && formData.confirmPassword) {
      const confirmError =
        formattedValue !== formData.confirmPassword
          ? 'Les mots de passe ne correspondent pas'
          : '';
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'nom',
      'prenom',
      'dateNaissance',
      'email',
      'telephone',
      'password',
      'confirmPassword',
      'role',
    ];

    requiredFields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (formData.codePostal) {
      const error = validateField('codePostal', formData.codePostal);
      if (error) newErrors.codePostal = error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const username = `${formData.prenom.toLowerCase()}_${formData.nom.toLowerCase()}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s/g, '');

      const userData = {
        username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.prenom,
        lastName: formData.nom,
        birthDate: formData.dateNaissance,
        phone: formData.telephone,
        postalCode: formData.codePostal || null,
      };

      const response = await authService.register(userData);
      console.log('✅ Inscription réussie :', response);

      const isPending = formData.role !== 'APPRENTI';

      navigate('/', {
        state: {
          message: isPending
            ? 'Demande envoyée. Un administrateur doit valider votre compte avant connexion.'
            : 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
          email: formData.email,
        },
      });
    } catch (error) {
      console.error("❌ Erreur d'inscription :", error);
      let errorMessage = "Une erreur est survenue lors de l'inscription";

      if (error.error) errorMessage = error.error;
      else if (error.message) errorMessage = error.message;

      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">I</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">IZIA</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Créer votre compte
          </h2>
          <p className="text-gray-600">
            Remplissez les informations obligatoires pour vous inscrire
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Identité */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`input-field ${errors.nom ? 'border-red-500' : ''}`}
                  />
                  {errors.nom && (
                    <p className="text-xs text-red-500 mt-1">{errors.nom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`input-field ${errors.prenom ? 'border-red-500' : ''}`}
                  />
                  {errors.prenom && (
                    <p className="text-xs text-red-500 mt-1">{errors.prenom}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    className={`input-field ${errors.dateNaissance ? 'border-red-500' : ''}`}
                  />
                  {errors.dateNaissance && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.dateNaissance}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleChange}
                    className={`input-field ${errors.codePostal ? 'border-red-500' : ''}`}
                  />
                  {errors.codePostal && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.codePostal}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section contact & connexion */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Contact & connexion
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse e-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="prenom.nom@reseau.eseo.fr"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Doit se terminer par <span className="font-mono">@reseau.eseo.fr</span>.
                  </p>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone portable <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={`input-field ${errors.telephone ? 'border-red-500' : ''}`}
                    placeholder="0XXXXXXXXX"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    10 chiffres, commençant par 0 (utilisé pour certains scénarios MFA par SMS).
                  </p>
                  {errors.telephone && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.telephone}
                    </p>
                  )}
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle souhaité <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`input-field ${errors.role ? 'border-red-500' : ''}`}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Les rôles autres que Apprenti doivent être validés par un administrateur avant connexion.
                    </p>
                    {errors.role && (
                      <p className="text-xs text-red-500 mt-1">{errors.role}</p>
                    )}
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`input-field pr-10 ${
                          errors.password ? 'border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-500"
                      >
                        {showPassword ? 'Masquer' : 'Afficher'}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.password}
                      </p>
                    )}

                    {/* Indicateur de force */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Force du mot de passe</span>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              passwordStrength >= level
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmation du mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`input-field pr-10 ${
                          errors.confirmPassword ? 'border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-500"
                      >
                        {showConfirmPassword ? 'Masquer' : 'Afficher'}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Erreur globale */}
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-700 flex items-center">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex items-center justify-between pt-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-800 font-medium flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour à la connexion
              </Link>

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Inscription en cours...
                  </span>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          <span className="text-red-500">*</span> Champs obligatoires
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;