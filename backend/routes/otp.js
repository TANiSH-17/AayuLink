const express = require('express');
const router = express.Router();

// ✅ Dummy OTP store (for quick testing)
const OTP_STORE = {}; // { phone: '123456' }

// Send OTP (dummy implementation: always 000000)
router.post('/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  // For testing: store fixed OTP
  OTP_STORE[phone] = '000000';
  console.log(`✅ [OTP] Sending dummy OTP 000000 to ${phone}`);
  return res.json({ success: true, message: 'OTP sent (always 000000 for testing)' });
});

// Verify OTP
router.post('/verify', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

  // Accept if matches or is 000000 (dummy)
  if (otp === '000000' || OTP_STORE[phone] === otp) {
    return res.json({ success: true, message: 'OTP verified' });
  }
  return res.status(400).json({ success: false, error: 'Invalid OTP' });
});

module.exports = router;
