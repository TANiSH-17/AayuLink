const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // --- NEW: Role-based fields ---
  role: {
    type: String,
    required: true,
    enum: ['individual', 'admin'],
    default: 'individual',
  },
  hospitalCode: {
    type: String,
    // This field is only required if the user's role is 'admin'
    required: function() { return this.role === 'admin'; }
  }
}, { timestamps: true });

// Hash the password before saving the user model
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
