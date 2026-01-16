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

        if (res?.mfaRequired) {
          const data = res.data || {};
          setStep('mfa');
          setPendingUserId(data.userId || data.user?.id || null);
          setDeliveryMethod(data.deliveryMethod || 'email');
          setMfaCode('');
          setErrors({});
          setIsLoading(false);
          return;
        }

        const user = res?.data?.user;
        let destination = '/dashboard';
        if (user?.role === 'ADMIN') {
          destination = '/admin';
        } else if (['MA', 'TP', 'PROF', 'CA', 'RC'].includes(user?.role)) {
          destination = '/tuteur-dashboard';
        }
        navigate(destination);
      } else {
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

        const user = authService.getCurrentUser();
        let destination = '/dashboard';
        if (user?.role === 'ADMIN') {
          destination = '/admin';
        } else if (['MA', 'TP', 'PROF', 'CA', 'RC'].includes(user?.role)) {
          destination = '/tuteur-dashboard';
        }
        navigate(destination);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>Rester connecté</span>
            </label>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Pas de compte ?{' '}
              <Link to="/register" className="text-primary-600 hover:underline">
                Inscription
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-700">
              Un code MFA a été envoyé par <b>{deliveryMethod || 'email'}</b>.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code MFA
              </label>
              <input
                type="text"
                name="mfaCode"
                className="input-field"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                disabled={isLoading}
              />
              {errors.mfaCode && (
                <p className="mt-1 text-xs text-red-600">{errors.mfaCode}</p>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Vérification...' : 'Valider'}
            </button>

            <button
              type="button"
              className="w-full text-sm text-gray-600 hover:underline"
              onClick={() => {
                setStep('credentials');
                setMfaCode('');
                setErrors({});
              }}
              disabled={isLoading}
            >
              Revenir aux identifiants
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default LoginForm;