const mongoose = require("mongoose");

const mfaTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// TTL automatique après expiration
mfaTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("MfaToken", mfaTokenSchema);