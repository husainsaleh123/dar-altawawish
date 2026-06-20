import mongoose from 'mongoose';

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, trim: true, default: null },
    countryCode: { type: String, trim: true, default: '+973' },
    phone: { type: String, trim: true, default: '' },
    // Kept temporarily for compatibility with the unique index created by the previous approval-link flow.
    tokenHash: { type: String, unique: true, sparse: true, select: false },
    codeHash: { type: String, required: true },
    verificationAttempts: { type: Number, default: 0, min: 0 },
    resendAvailableAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model('PendingRegistration', pendingRegistrationSchema);
