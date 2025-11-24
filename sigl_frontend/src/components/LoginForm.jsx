// sigl_frontend/src/components/LoginForm.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // MFA
  const [step, setStep] = useState('credentials'); // 'credentials' | 'mfa'
  const [pendingUserId, setPendingUserId] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(null); // 'email' | 'sms'
  const [mfaCode, setMfaCode] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
      submit: undefined,
    }));
  };

  const validateCredentials = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est obligatoire";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (step === 'credentials') {
        const validationErrors = validateCredentials();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setIsLoading(false);
          return;
        }

        const res = await authService.login(
          formData.email.trim(),
          formData.password,
          formData.rememberMe
        );

        if (res.mfaRequired) {
          const data = res.data || {};

          setStep('mfa');
          setPendingUserId(data.userId || data.user?.id || null);
          setDeliveryMethod(data.deliveryMethod || 'email');
          setMfaCode('');
          setErrors({});
          setIsLoading(false);
          return;
        }

        // Login sans MFA : tokens déjà stockés
        navigate('/dashboard');
      } else {
        // Étape MFA
        if (!mfaCode.trim()) {
          setErrors((prev) => ({
            ...prev,
            mfaCode: 'Le code MFA est requis',
          }));
          setIsLoading(false);
          return;
        }

        await authService.verifyMfaCode(
          pendingUserId,
          mfaCode.trim(),
          formData.rememberMe
        );

        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Erreur de connexion :', err);
      const message =
        err?.message ||
        err?.error ||
        err?.response?.data?.message ||
        "Échec de la connexion, veuillez vérifier vos informations.";
      setErrors((prev) => ({
        ...prev,
        submit: message,
      }));
      setIsLoading(false);
    }
  };

  const isCredentialsStep = step === 'credentials';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {errors.submit}
          </div>
        )}

        {isCredentialsStep ? (
          <>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember me + forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>Se souvenir de moi</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              Un code de vérification a été envoyé par{' '}
              <span className="font-semibold">
                {deliveryMethod === 'sms' ? 'SMS' : 'email'}
              </span>
              .
            </p>

            <div>
              <label
                htmlFor="mfaCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Code de vérification
              </label>
              <input
                id="mfaCode"
                name="mfaCode"
                type="text"
                inputMode="numeric"
                className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                  errors.mfaCode ? 'border-red-500' : 'border-gray-300'
                }`}
                value={mfaCode}
                onChange={(e) => {
                  setMfaCode(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    mfaCode: undefined,
                    submit: undefined,
                  }));
                }}
              />
              {errors.mfaCode && (
                <p className="mt-1 text-xs text-red-600">{errors.mfaCode}</p>
              )}
            </div>

            <button
              type="button"
              className="text-xs text-gray-500 underline"
              onClick={() => {
                setStep('credentials');
                setMfaCode('');
                setErrors({});
              }}
            >
              Retour aux identifiants
            </button>
          </>
        )}

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : isCredentialsStep ? 'Se connecter' : 'Valider le code'}
          </button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700">
          Créer un compte
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;