import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestConnection = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Test automatique au chargement
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Appel à la route /status du backend
      const response = await axios.get('http://localhost:3000/status');
      console.log('✅ Réponse du backend:', response.data);
      setStatus(response.data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔗 Test de connexion Frontend ↔ Backend
        </h1>

        {/* Statut du chargement */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="ml-3 text-gray-600">Test en cours...</span>
          </div>
        )}

        {/* Affichage de l'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold mb-1">❌ Échec de la connexion</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <div className="mt-3 text-sm text-red-600">
                  <p className="font-semibold mb-1">Vérifiez que :</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Le backend est démarré sur le port 3000</li>
                    <li>MongoDB est en cours d'exécution</li>
                    <li>CORS est configuré dans App.js</li>
                    <li>La route /status existe</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affichage du succès */}
        {status && !loading && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-green-800 font-semibold mb-2">✅ Connexion réussie !</h3>
                <div className="bg-white rounded border border-green-200 p-4">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Réponse du serveur :</p>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(status, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informations de configuration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-blue-800 font-semibold mb-2">ℹ️ Configuration</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><span className="font-semibold">URL Backend:</span> http://localhost:3000</p>
            <p><span className="font-semibold">URL Frontend:</span> http://localhost:5173</p>
            <p><span className="font-semibold">Route testée:</span> /status</p>
          </div>
        </div>

        {/* Bouton pour retester */}
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Test en cours...' : '🔄 Retester la connexion'}
        </button>

        {/* Instructions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">📝 Comment lancer les serveurs :</h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-700">Backend (Terminal 1) :</p>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                cd backend && node App.js
              </code>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Frontend (Terminal 2) :</p>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                cd frontend && npm run dev
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
