const express = require('express');
const User = require('../models/user');
const Hospital = require('../models/hospital');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware'); // ✅ 1. IMPORT THE MIDDLEWARE
const router = express.Router();

// --- POST /api/auth/register ---
router.post('/register', async (req, res) => {
  const { username, password, role, hospitalName, specialCode } = req.body;
  try {
    const userExists = await User.findOne({ username, role });
    if (userExists) {
      return res.status(400).json({ message: 'This username is already registered for the selected role.' });
    }
    if (role === 'admin') {
      if (!hospitalName || !specialCode) {
        return res.status(400).json({
          message: 'Hospital Name and a Special Code are required for admin registration.'
        });
      }
      const formattedCode = specialCode.toUpperCase();
      let hospital = await Hospital.findOne({ code: formattedCode });
      if (!hospital) {
        hospital = new Hospital({ name: hospitalName, code: formattedCode });
        await hospital.save();
      }
    }
    const user = await User.create({
      username,
      password,
      role: role || 'individual',
      hospitalName: role === 'admin' ? hospitalName : undefined,
      hospitalCode: role === 'admin' ? specialCode.toUpperCase() : undefined
    });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} user registered successfully!`
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- POST /api/auth/login ---
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required.' });
    }
    const user = await User.findOne({ username, role });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials for the selected role.' });
    }
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        hospitalName: user.hospitalName || null,
        hospitalCode: user.hospitalCode || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// ✅ 2. ADD THE MISSING VERIFICATION ROUTE
// --- GET /api/auth/verify ---
// This protected route verifies a token and returns user data.
router.get('/verify', protect, (req, res) => {
  // If the 'protect' middleware is successful, it attaches the user data to the request object.
  // We simply send that user data back to the frontend.
  res.status(200).json({ user: req.user });
});

module.exports = router;