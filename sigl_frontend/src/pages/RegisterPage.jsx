import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

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
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation en temps réel
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

      case 'dateNaissance':
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

      case 'telephone':
        if (!value.trim()) {
          error = 'Le numéro de téléphone est requis';
        } else if (!/^0\d{9}$/.test(value)) {
          error = 'Le numéro doit contenir 10 chiffres et commencer par 0';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Format d\'email invalide (doit contenir @)';
        } else if (!value.endsWith('@eseo.fr')) {
          error = 'L\'email doit se terminer par @eseo.fr';
        }
        break;

      case 'codePostal':
        // Optionnel, mais si rempli doit être valide
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

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formater le téléphone (supprimer tout sauf les chiffres)
    let formattedValue = value;
    if (name === 'telephone') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Formater le code postal (supprimer tout sauf les chiffres)
    if (name === 'codePostal') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Validation en temps réel
    const error = validateField(name, formattedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Si on modifie le password, revalider confirmPassword
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = formattedValue !== formData.confirmPassword 
        ? 'Les mots de passe ne correspondent pas' 
        : '';
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Valider uniquement les champs obligatoires et remplis
    const requiredFields = ['nom', 'prenom', 'dateNaissance', 'email', 'telephone', 'password', 'confirmPassword'];
    
    requiredFields.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Valider le code postal s'il est rempli
    if (formData.codePostal) {
      const error = validateField('codePostal', formData.codePostal);
      if (error) newErrors.codePostal = error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Générer le username à partir du prénom et nom
      const username = `${formData.prenom.toLowerCase()}_${formData.nom.toLowerCase()}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
        .replace(/\s/g, '');

      const userData = {
        username: username,
        email: formData.email,  // Email ESEO
        password: formData.password,
        role: 'APPRENTI',
        firstName: formData.prenom,
        lastName: formData.nom,
        birthDate: formData.dateNaissance,
        phone: formData.telephone,
        postalCode: formData.codePostal || null,
      };

      const response = await authService.register(userData);
      
      console.log('✅ Inscription réussie:', response);
      
      // Redirection vers la page de connexion avec message de succès
      navigate('/', { 
        state: { 
          message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
          email: formData.email
        } 
      });

    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Indicateur de force du mot de passe
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
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                📋 Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`input-field ${errors.nom ? 'border-red-500' : ''}`}
                    placeholder="DUPONT"
                    disabled={isLoading}
                  />
                  {errors.nom && (
                    <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
                  )}
                </div>

                {/* Prénom */}
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={`input-field ${errors.prenom ? 'border-red-500' : ''}`}
                    placeholder="Jean"
                    disabled={isLoading}
                  />
                  {errors.prenom && (
                    <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>
                  )}
                </div>

                {/* Date de naissance */}
                <div>
                  <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dateNaissance"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    className={`input-field ${errors.dateNaissance ? 'border-red-500' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                  />
                  {errors.dateNaissance && (
                    <p className="mt-1 text-xs text-red-600">{errors.dateNaissance}</p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={`input-field ${errors.telephone ? 'border-red-500' : ''}`}
                    placeholder="0612345678"
                    maxLength="10"
                    disabled={isLoading}
                  />
                  {errors.telephone && (
                    <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">10 chiffres, commençant par 0</p>
                </div>
              </div>
            </div>

            {/* Section Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                📧 Coordonnées
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email ESEO */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email ESEO <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="prenom.nom@eseo.fr"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Doit se terminer par @eseo.fr</p>
                </div>

                {/* Code postal (optionnel) */}
                <div>
                  <label htmlFor="codePostal" className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    id="codePostal"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleChange}
                    maxLength="5"
                    className={`input-field ${errors.codePostal ? 'border-red-500' : ''}`}
                    placeholder="49000"
                    disabled={isLoading}
                  />
                  {errors.codePostal && (
                    <p className="mt-1 text-xs text-red-600">{errors.codePostal}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section Mot de passe */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                🔒 Sécurité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                  
                  {/* Indicateur de force */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < passwordStrength
                                ? passwordStrength < 3
                                  ? 'bg-red-500'
                                  : passwordStrength < 4
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {passwordStrength < 3 && 'Faible'}
                        {passwordStrength === 3 && 'Moyen'}
                        {passwordStrength === 4 && 'Bon'}
                        {passwordStrength === 5 && 'Excellent'}
                      </p>
                    </div>
                  )}
                  
                  <p className="mt-2 text-xs text-gray-500">
                    • Min. 8 caractères<br/>
                    • 1 majuscule, 1 minuscule<br/>
                    • 1 chiffre, 1 caractère spécial
                  </p>
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                  {formData.confirmPassword && !errors.confirmPassword && (
                    <p className="mt-1 text-xs text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Les mots de passe correspondent
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Erreur générale */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
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
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

        {/* Légende */}
        <p className="text-center text-sm text-gray-600 mt-6">
          <span className="text-red-500">*</span> Champs obligatoires
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
