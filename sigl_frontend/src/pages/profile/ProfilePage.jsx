import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const ProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser(); // lu dans localStorage
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestSending, setRequestSending] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [requestedRole, setRequestedRole] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await authService.getUserProfile(currentUser.id);
        const user = profile.user || profile; // suivant la forme de la réponse

        setDisplayName(user.nom || "");
        setEmail(user.email || "");
        setRole(user.role || "");
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
        setFeedback("Impossible de charger votre profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setFeedback("");

    try {
      // L’API attend { username, email } et sauvegarde dans nom/email
      const updated = await authService.updateProfile(currentUser.id, {
        username: displayName,
        email,
      });

      // on met aussi à jour le user en localStorage
      const stored = authService.getCurrentUser();
      authService.setCurrentUser({
        ...stored,
        nom: updated.user ? updated.user.nom : displayName,
        email: updated.user ? updated.user.email : email,
      });

      setFeedback("Profil mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur de mise à jour du profil :", error);
      setFeedback(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSendRoleRequest = async (e) => {
    e.preventDefault();
    if (!currentUser || !requestedRole) return;

    setRequestSending(true);
    setFeedback("");

    try {
      await authService.requestRoleChange(
        currentUser.id,
        requestedRole,
        reason
      );
      setFeedback(
        "Votre demande de changement de rôle a été envoyée à l'administrateur."
      );
      setReason("");
      setRequestedRole("");
    } catch (error) {
      console.error("Erreur demande de changement de rôle :", error);
      setFeedback(
        error.response?.data?.message ||
          "Impossible d'envoyer la demande de changement de rôle."
      );
    } finally {
      setRequestSending(false);
    }
  };

  if (!currentUser) {
    return null; // redirection déjà faite dans useEffect
  }

  if (loading) {
    return (
      <div className="p-8">
        <p>Chargement du profil…</p>
      </div>
    );
  }

  const avatarLetter =
    (displayName && displayName.trim()[0]?.toUpperCase()) ||
    (currentUser.nom && currentUser.nom[0]?.toUpperCase()) ||
    "?";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mon profil</h1>
          <p className="text-sm text-gray-500">
            Gérez vos informations personnelles et votre rôle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {avatarLetter}
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {displayName || currentUser.nom}
            </div>
            <div className="text-xs text-gray-500">{role}</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        {feedback && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded">
            {feedback}
          </div>
        )}

        {/* Infos de profil */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Informations personnelles</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom affiché (Prénom + Nom)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rôle actuel
              </label>
              <input
                type="text"
                value={role}
                disabled
                className="mt-1 w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </section>

        {/* Demande de changement de rôle */}
        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Demander un changement de rôle</h2>
          <p className="text-sm text-gray-500">
            Cette demande sera visible uniquement par un administrateur, qui
            pourra l&apos;accepter ou la refuser.
          </p>

          <form onSubmit={handleSendRoleRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rôle souhaité
              </label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un rôle</option>
                <option value="APPRENTI">Apprenti</option>
                <option value="MA">Maître d&apos;Apprentissage</option>
                <option value="TP">Tuteur Pédagogique</option>
                <option value="CA">Coordinatrice</option>
                <option value="RC">Responsable Cursus</option>
                <option value="PROF">Professeur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Justification (optionnelle mais recommandée)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Expliquez pourquoi vous demandez ce changement de rôle…"
              />
            </div>

            <button
              type="submit"
              disabled={requestSending || !requestedRole}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-60"
            >
              {requestSending
                ? "Envoi de la demande…"
                : "Envoyer la demande à l'admin"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;