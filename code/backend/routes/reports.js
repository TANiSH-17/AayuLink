const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Patient = require('../models/patient');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    },
  };
}

// ✅ 1. UPLOAD ROUTE: Just saves the file to the database. No AI call.
router.post('/upload/:abhaId', protect, admin, upload.single('reportFile'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const newReport = {
      type: req.body.reportType || 'Medical Report',
      date: new Date(req.body.reportDate),
      fileName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileData: req.file.buffer.toString('base64'), // Store file content
    };

    patient.reportsAndScans.push(newReport);
    await patient.save();
    
    // Send back the newly created report object, which includes its unique _id
    res.status(201).json({ message: 'Report uploaded successfully!', newReport: patient.reportsAndScans.slice(-1)[0] });
  } catch (error) {
    console.error("Error uploading report:", error);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
});

// ✅ 2. ANALYZE ROUTE: Finds an existing report, calls the AI, and updates the record.
router.post('/analyze/:abhaId/:reportId', protect, admin, async (req, res) => {
  try {
    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
        return res.status(404).json({ message: 'Patient not found.' });
    }
    
    const report = patient.reportsAndScans.id(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    if (report.aiAnalysis && report.aiAnalysis.summary) {
      return res.status(400).json({ message: 'This report has already been analyzed.' });
    }

    const prompt = `Analyze this medical ${report.type}. Provide a concise one-paragraph summary, list key findings as bullet points, and suggest potential next steps. Respond in structured JSON format with keys: "summary", "findings", "recommendations".`;
    const filePart = [fileToGenerativePart(Buffer.from(report.fileData, 'base64'), report.fileMimeType)];
    
    const result = await model.generateContent([prompt, ...filePart]);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const aiAnalysis = JSON.parse(responseText);

    // Update the specific report's aiAnalysis field
    report.aiAnalysis = aiAnalysis;
    await patient.save();

    res.status(200).json({ message: 'Analysis complete!', aiAnalysis });
  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ message: 'Failed to analyze report.' });
  }
});

// ✅ 3. DELETE ROUTE: Remains ready for use.
router.delete('/:abhaId/:reportId', protect, admin, async (req, res) => {
  try {
    const { abhaId, reportId } = req.params;

    const patient = await Patient.findOneAndUpdate(
      { abhaId: abhaId },
      { $pull: { reportsAndScans: { _id: reportId } } }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    res.status(200).json({ message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error while deleting report.' });
  }
});

module.exports = router;