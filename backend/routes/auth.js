const express = require('express');
const User = require('../models/user');
const Hospital = require('../models/hospital'); // <-- Import the Hospital model from your Canvas
const router = express.Router();

// --- POST /api/auth/register ---
// This route now handles dynamic hospital registration.
router.post('/register', async (req, res) => {
  // It now expects 'hospitalName' and 'specialCode' for admin registration
  const { username, password, role, hospitalName, specialCode } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'This username is already taken.' });
    }

    // --- Dynamic Hospital Logic ---
    if (role === 'admin') {
      if (!hospitalName || !specialCode) {
        return res.status(400).json({ message: 'Hospital Name and a Special Code are required for admin registration.' });
      }
      
      const formattedCode = specialCode.toUpperCase();

      // Check if a hospital with this code already exists. The model field is 'code'.
      let hospital = await Hospital.findOne({ code: formattedCode });

      // If the hospital does NOT exist, create it.
      if (!hospital) {
        console.log(`New hospital code detected: ${formattedCode}. Registering new hospital...`);
        hospital = new Hospital({
          name: hospitalName,
          code: formattedCode, // Use 'code' to match your hospital.js model
        });
        await hospital.save();
        console.log(`Successfully registered new hospital: ${hospital.name}`);
      }
    }

    // Proceed with creating the new user (individual or admin)
    const user = await User.create({
      username,
      password,
      role: role || 'individual',
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
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// --- POST /api/auth/login ---
// The login route works for both user types without any changes needed.
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;

