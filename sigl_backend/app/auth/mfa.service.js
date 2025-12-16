// sigl_backend/app/auth/mfa.service.js
const MfaToken = require("./mfaToken.model");
const nodemailer = require("nodemailer");

function generateCode() {
  // Code à 6 chiffres
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isSmtpConfigured() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

async function sendEmailCode(user, code) {
  // --- MODE DEV : SMTP non configuré -> on log seulement ---
  if (!isSmtpConfigured()) {
    console.warn(
      "[MFA EMAIL] SMTP non configuré (.env). Code simulé pour %s : %s",
      user.email,
      code
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"IZIA" <no-reply@izia.local>',
      to: user.email,
      subject: "Votre code de connexion IZIA",
      text: `Votre code de connexion est : ${code}`,
    });

    console.log(
      "[MFA EMAIL] Code envoyé à %s (méthode email)",
      user.email
    );
  } catch (err) {
    // On ne veut PAS empêcher la connexion MFA en dev si le SMTP bug
    console.error(
      "[MFA EMAIL] Erreur lors de l'envoi du mail, fallback console :",
      err
    );
    console.log(
      "[MFA EMAIL] Code pour %s (non envoyé par mail) : %s",
      user.email,
      code
    );
  }
}

async function sendSmsCode(user, code) {
  // Pour l’instant on simule le SMS
  console.log(
    `[MFA SMS] Code pour ${user.telephone || "numéro inconnu"} : ${code}`
  );
  // Si tu ajoutes Twilio / OVH plus tard, ce sera ici.
}

/**
 * Crée un code MFA, le stocke, et l'envoie via email ou SMS.
 * @param {Object} user - document Utilisateur mongoose
 * @returns {"email" | "sms"} méthode utilisée
 */
async function createAndSendMfaCode(user) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // On supprime les anciens codes non consommés pour cet utilisateur
  await MfaToken.deleteMany({
    user: user._id,
    consumedAt: null,
  });

  // On crée le nouveau token
  await MfaToken.create({
    user: user._id,
    code: String(code).trim(),
    expiresAt,
  });

  // Choix du canal
  if (user.mfaMethod === "sms" && user.telephone) {
    await sendSmsCode(user, code);
    return "sms";
  } else {
    await sendEmailCode(user, code);
    return "email";
  }
}

/**
 * Vérifie un code MFA.
 * IMPORTANT : on s'appuie UNIQUEMENT sur le code pour retrouver le token,
 * puis on récupère le userId depuis ce token.
 *
 * @param {string} rawCode - code saisi par l'utilisateur
 * @returns {Promise<MfaToken|null>} token MFA consommé ou null
 */
async function verifyMfaCode(rawCode) {
  const normalizedCode = String(rawCode || "").trim();

  if (!normalizedCode) {
    return null;
  }

  // On récupère le dernier token non consommé avec ce code
  const token = await MfaToken.findOne({
    code: normalizedCode,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!token) {
    return null;
  }

  token.consumedAt = new Date();
  await token.save();

  return token;
}

module.exports = {
  createAndSendMfaCode,
  verifyMfaCode,
};