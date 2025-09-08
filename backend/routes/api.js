// backend/routes/api.js
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// --- AI Model Initialization ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- MOCK PATIENT DATA ---
const mockPatientData = {
  abhaId: "12-3456-7890-1234",
  personalInfo: { name: "Dhruv Gupta", age: 45, gender: "Male", bloodType: "O+", emergencyContact: "Anjali Gupta (Wife) - +91 98765 43210" },
  criticalInfo: { allergies: ["Penicillin", "Peanuts"], chronicConditions: ["Hypertension", "Type 2 Diabetes"], currentMedications: [{ name: "Metformin", dosage: "500mg daily" }, { name: "Lisinopril", dosage: "10mg daily" }] },
  medicalHistory: [
    { recordId: "REC789012", date: "2024-05-15", type: "Discharge Summary", hospital: "Apollo Hospital, Delhi", doctor: "Dr. Mehta", details: "Patient admitted for chest pain. Diagnosed with stable angina. Prescribed medication and advised lifestyle changes. Discharged in stable condition." },
    { recordId: "REC456789", date: "2024-02-20", type: "Lab Report", hospital: "Max Healthcare, Saket", doctor: "Lab Services", details: "Fasting Blood Sugar: 140 mg/dL (High). HbA1c: 7.2% (High). Cholesterol levels within normal range." },
    { recordId: "REC123456", date: "2023-11-10", type: "Prescription", hospital: "AIIMS, New Delhi", doctor: "Dr. Sharma", details: "Patient reported consistent high blood pressure readings. Prescribed Lisinopril 10mg. Follow-up in 3 months." },
  ]
};


// --- DATA & AI ROUTES ---

// Fetch Patient Records
router.post('/fetch-records', (req, res) => {
  const { abhaId } = req.body;
  if (!abhaId) return res.status(400).json({ error: 'ABHA ID is required.' });
  setTimeout(() => res.status(200).json(mockPatientData), 1500);
});

// AI Summarization
router.post('/summarize', async (req, res) => {
  const { medicalRecords } = req.body;
  if (!medicalRecords || medicalRecords.length === 0) return res.status(400).json({ error: 'Medical records are required.' });
  
  const recordsText = medicalRecords.map(r => `Date: ${r.date}\nType: ${r.type}\nDetails: ${r.details}`).join('\n\n---\n\n');
  const prompt = `Summarize these medical records for a busy doctor. Structure the output with sections for "Critical Alerts", "Key Medical History" (bulleted), and "Current Medications". Records:\n---\n${recordsText}\n---`;

  try {
    const result = await model.generateContent(prompt);
    res.status(200).json({ summary: result.response.text() });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: 'Failed to generate AI summary.' });
  }
});

// AI Chat
router.post('/chat', async (req, res) => {
    const { medicalRecords, question } = req.body;
    if (!medicalRecords || !question) return res.status(400).json({ error: 'Medical history and a question are required.' });

    const recordsText = medicalRecords.map(r => `On ${r.date}, a ${r.type} stated: "${r.details}"`).join('\n');
    const prompt = `Answer the doctor's question based *only* on the provided records. If the answer isn't in the records, say so. Records:\n---BEGIN RECORDS---\n${recordsText}\n---END RECORDS---\n\nDoctor's Question: "${question}"\n\nAnswer:`;

    try {
        const result = await model.generateContent(prompt);
        res.status(200).json({ answer: result.response.text() });
    } catch (error) {
        console.error("Error in AI chat:", error);
        res.status(500).json({ error: 'Failed to get answer from AI.' });
    }
});

module.exports = router;

