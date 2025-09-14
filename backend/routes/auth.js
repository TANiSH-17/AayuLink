const express = require('express');
const User = require('../models/user');
const Hospital = require('../models/hospital'); // Import the Hospital model
const router = express.Router();                // ✅ Create the router instance

// --- POST /api/auth/register ---
// This route now handles dynamic hospital registration.
router.post('/register', async (req, res) => {
  const { username, password, role, hospitalName, specialCode } = req.body;

  try {
    // --- THIS IS THE FIX ---
    // The query now checks if a user exists with the same username AND role.
    const userExists = await User.findOne({ username, role });
    if (userExists) {
      // Updated the error message to be more specific.
      return res.status(400).json({ message: 'This username is already registered for the selected role.' });
    }

    // --- Dynamic Hospital Logic ---
    if (role === 'admin') {
      if (!hospitalName || !specialCode) {
        return res.status(400).json({
          message: 'Hospital Name and a Special Code are required for admin registration.'
        });
      }

      const formattedCode = specialCode.toUpperCase();
      let hospital = await Hospital.findOne({ code: formattedCode });

      if (!hospital) {
        console.log(`New hospital code detected: ${formattedCode}. Registering new hospital...`);
        hospital = new Hospital({
          name: hospitalName,
          code: formattedCode,
        });
        await hospital.save();
        console.log(`Successfully registered new hospital: ${hospital.name}`);
      }
    }

    // Save both hospitalName and hospitalCode to match the schema
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
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- POST /api/auth/login --- (UPDATED)
// This route now validates the role selected on the frontend.
router.post('/login', async (req, res) => {
  try {
    // 1. Destructure 'role' from the request body
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required.' });
    }

    // 2. Find the user by BOTH username and role
    const user = await User.findOne({ username, role });

    // 3. Check credentials against the user found for that specific role
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials for the selected role.' });
    }

    const userPayload = {
      id: user._id,
      username: user.username,
      role: user.role,
      hospitalName: user.hospitalName || null,
      hospitalCode: user.hospitalCode || null
    };

    res.status(200).json({ message: 'Login successful', user: userPayload });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

module.exports = router;   // ✅ Ensure router is exported

