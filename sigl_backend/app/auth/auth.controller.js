// sigl_backend/app/auth/auth.controller.js
const authService = require('./auth.service');
const authRepository = require('./auth.repository');
const MfaService = require('./mfa.service');

class AuthController {
  // ------------------ REGISTER ------------------
  async register(req, res) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          error: 'MISSING_FIELDS',
        });
      }

      const existing = await authRepository.findAuthByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email',
          error: 'USER_ALREADY_EXISTS',
        });
      }

      const user = await authService.createUserWithCredentials(
        email,
        password,
        role
      );
      console.log(`User registered: ${email} - ${new Date().toISOString()}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('Register error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        error: 'REGISTER_ERROR',
      });
    }
  }

  // ------------------ LOGIN + MFA (étape 1) ------------------
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          error: 'MISSING_FIELDS',
        });
      }

      const authRecord = await authRepository.findAuthByEmail(email);
      if (!authRecord || !authRecord.user) {
        console.log(
          `Failed login attempt for email: ${email} - User not found - ${new Date().toISOString()}`
        );
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS',
        });
      }

      // Vérif lock
      let accountLocked = false;
      try {
        if (authRepository.isAccountLocked) {
          accountLocked = await authRepository.isAccountLocked(
            authRecord.userId
          );
        }
      } catch (lockErr) {
        console.error(
          'Check account lock failed:',
          lockErr.message || lockErr
        );
      }

      if (accountLocked) {
        console.log(
          `Login blocked: account locked for user ${authRecord.user.email} - ${new Date().toISOString()}`
        );
        return res.status(403).json({
          success: false,
          message:
            'Votre compte est temporairement verrouillé suite à plusieurs tentatives de connexion échouées.',
          error: 'ACCOUNT_LOCKED',
        });
      }

      // Vérif mot de passe
      const isPasswordValid = await authService.comparePassword(
        password,
        authRecord.passwordHash
      );

      if (!isPasswordValid) {
        await authRepository.incrementFailedAttempts(authRecord.userId);

        console.log(
          `Failed login attempt for email: ${email} - Invalid password - ${new Date().toISOString()}`
        );

        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS',
        });
      }

      // Reset tentatives
      await authRepository.resetFailedAttempts(authRecord.userId);

      // MFA activé ?
      if (authRecord.user.mfaEnabled) {
        try {
          const delivery = await MfaService.createAndSendMfaCode(
            authRecord.user
          );

          console.log(
            `MFA code sent via ${delivery} for user ${authRecord.user.email} - ${new Date().toISOString()}`
          );

          return res.status(200).json({
            success: true,
            message: 'MFA code sent',
            mfaRequired: true,
            data: {
              userId: authRecord.user._id,
              deliveryMethod: delivery,
              email: authRecord.user.email,
            },
          });
        } catch (mfaError) {
          console.error('MFA send code error:', mfaError);
          return res.status(500).json({
            success: false,
            message: 'Unable to send MFA code',
            error: 'MFA_SEND_ERROR',
          });
        }
      }

      // MFA désactivé → login normal
      const tokens = authService.generateTokenPair(
        authRecord.userId.toString(),
        authRecord.user.email,
        authRecord.user.role
      );

      await authService.storeRefreshToken(
        authRecord.userId,
        tokens.refreshToken
      );

      console.log(
        `Successful login: ${email} (${authRecord.user.role}) - ${new Date().toISOString()}`
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: authRecord.user._id,
            nom: authRecord.user.nom,
            email: authRecord.user.email,
            role: authRecord.user.role,
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: tokens.tokenType,
            expiresIn: tokens.expiresIn,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
        error: 'LOGIN_ERROR',
      });
    }
  }

  // ------------------ MFA (étape 2) ------------------
  async verifyMfaCode(req, res) {
    try {
      const { userId, code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Code is required',
          error: 'MFA_MISSING_CODE',
        });
      }

      // Vérification du code (on ne se fie qu’au code, pas à userId)
      const token = await MfaService.verifyMfaCode(code);
      if (!token) {
        console.log(
          `Invalid MFA code "${code}" (userId reçu: ${userId || 'null'}) - ${new Date().toISOString()}`
        );
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired MFA code',
          error: 'MFA_INVALID_CODE',
        });
      }

      const effectiveUserId = token.user.toString();

      // ⚠️ findAuthByUserId renvoie un doc avec userId *peuplé*,
      // donc la structure est : { userId: { _id, nom, email, role }, ... }
      const authRecord = await authRepository.findAuthByUserId(
        effectiveUserId
      );

      if (!authRecord || !authRecord.userId) {
        return res.status(404).json({
          success: false,
          message: 'User authentication record not found',
          error: 'AUTH_RECORD_NOT_FOUND',
        });
      }

      const user = authRecord.userId; // doc Utilisateur populé

      const tokens = authService.generateTokenPair(
        user._id.toString(),
        user.email,
        user.role
      );

      await authService.storeRefreshToken(
        authRecord.userId,
        tokens.refreshToken
      );

      console.log(
        `MFA verified and login completed for user ${user.email} - ${new Date().toISOString()}`
      );

      return res.status(200).json({
        success: true,
        message: 'MFA verification successful',
        data: {
          user: {
            id: user._id,
            nom: user.nom,
            email: user.email,
            role: user.role,
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: tokens.tokenType,
            expiresIn: tokens.expiresIn,
          },
        },
      });
    } catch (error) {
      console.error('MFA verify error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during MFA verification',
        error: 'MFA_VERIFY_ERROR',
      });
    }
  }

  // ------------------ LOGOUT ------------------
  async logout(req, res) {
    try {
      const { userId } = req.user;
      await authService.revokeRefreshToken(userId);

      console.log(
        `User logout: ${req.user.email} - ${new Date().toISOString()}`
      );

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout',
        error: 'LOGOUT_ERROR',
      });
    }
  }

  // ------------------ REFRESH TOKEN ------------------
  async refreshAccessToken(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required',
          error: 'MISSING_REFRESH_TOKEN',
        });
      }

      let refreshToken;
      try {
        refreshToken = authService.extractBearerToken(authHeader);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid authorization header format',
          error: 'INVALID_HEADER_FORMAT',
        });
      }

      let decoded;
      try {
        decoded = authService.verifyToken(refreshToken, 'refresh');
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
          error: 'INVALID_REFRESH_TOKEN',
        });
      }

      const authRecord = await authRepository.findAuthByRefreshToken(
        refreshToken
      );
      if (!authRecord || !authRecord.userId) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token not found or revoked',
          error: 'REFRESH_TOKEN_REVOKED',
        });
      }

      const user = authRecord.userId;

      const newAccessToken = authService.generateAccessToken(
        user._id.toString(),
        user.email,
        user.role
      );

      res.status(200).json({
        success: true,
        message: 'Access token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          tokenType: 'Bearer',
          expiresIn: 3600,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error during token refresh',
        error: 'REFRESH_TOKEN_ERROR',
      });
    }
  }
}

module.exports = new AuthController();