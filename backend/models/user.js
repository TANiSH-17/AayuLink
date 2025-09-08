// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: { // e.g., 'doctor', 'staff'
    type: String,
    default: 'doctor',
  }
});

module.exports = mongoose.model('User', UserSchema);