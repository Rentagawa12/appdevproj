import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  password: { type: String, required: true },
  salt:     { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Hash password using built-in crypto (no bcrypt dependency needed)
userSchema.methods.setPassword = function (plaintext) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto
    .pbkdf2Sync(plaintext, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

userSchema.methods.validatePassword = function (plaintext) {
  const hash = crypto
    .pbkdf2Sync(plaintext, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.password === hash;
};

export default mongoose.model('User', userSchema);
