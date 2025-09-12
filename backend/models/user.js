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
    required: function() { return this.role === 'admin'; },
    uppercase: true,
  }
}, { timestamps: true });

// This function automatically hashes the user's password before saving it to the database
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// This is a helper method to compare the password entered during login with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

