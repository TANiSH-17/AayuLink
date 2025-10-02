const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Patient = require('../models/patient');
const { protect, admin } = require('../middleware/authMiddleware');
const dbConnect = require('../lib/dbConnect');
const cloudinary = require('../lib/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// helper to package binary into Gemini part
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    },
  };
}

// helper: upload a buffer to Cloudinary via stream
function uploadBufferToCloudinary(buffer, { mimeType, fileName }) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'reports',
        resource_type: 'auto',
        // keep original name (without extension) as public_id base (Cloudinary will uniquify if needed)
        public_id: fileName ? fileName.split('.').slice(0, -1).join('.') : undefined,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// ============================
// UPLOAD ROUTE
// ============================
router.post('/upload/:abhaId', protect, admin, upload.single('reportFile'), async (req, res) => {
  try {
    await dbConnect();

    const patient = await Patient.findOne({ abhaId: req.params.abhaId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided.' });
    }

    // 1) Upload to Cloudinary
    const cloud = await uploadBufferToCloudinary(req.file.buffer, {
      mimeType: req.file.mimetype,
      fileName: req.file.originalname,
    });

    // 2) Build the report object
    // - Keep existing front-end fields: fileName, format, filePath
    // - Also save Cloudinary extras: fileUrl, filePublicId, fileMimeType
    const format = cloud.format || (req.file.mimetype?.split('/')[1] || 'bin');

    const newReport = {
      type: req.body.reportType || 'Medical Report',
      date: req.body.reportDate ? new Date(req.body.reportDate) : new Date(),

      fileName: req.file.originalname,
      format,
      filePath: cloud.secure_url,       // legacy compatibility: same as URL
      textContent: '',

      fileUrl: cloud.secure_url,
      filePublicId: cloud.public_id,
      fileMimeType: req.file.mimetype,
    };

    // 3) Save on the patient doc
    patient.reportsAndScans.push(newReport);
    await patient.save();

    // 4) Respond with the newly-added report (same shape you used before, now with URL)
    res.status(201).json({
      message: 'Report uploaded successfully!',
      newReport: patient.reportsAndScans[patient.reportsAndScans.length - 1],
    });
  } catch (error) {
    console.error("Error uploading report:", error);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
});

// ============================
// ANALYZE ROUTE
// ============================
// (now fetches file from Cloudinary URL instead of Mongo base64)
router.post('/analyze/:abhaId/:reportId', protect, admin, async (req, res) => {
  try {
    await dbConnect();

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

    // Fetch file bytes from Cloudinary
    const url = report.fileUrl || report.filePath; // filePath kept for backward compatibility
    if (!url) return res.status(400).json({ message: 'No file URL on report.' });

    const fileRes = await axios.get(url, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(fileRes.data);
    const mimeType = report.fileMimeType || `application/${report.format || 'octet-stream'}`;

    const prompt = `Analyze this medical ${report.type}. Provide a concise one-paragraph summary, list key findings as bullet points, and suggest potential next steps. Respond in structured JSON format with keys: "summary", "findings", "recommendations".`;

    const filePart = [fileToGenerativePart(fileBuffer, mimeType)];

    const result = await model.generateContent([prompt, ...filePart]);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const aiAnalysis = JSON.parse(responseText);

    report.aiAnalysis = aiAnalysis;
    await patient.save();

    res.status(200).json({ message: 'Analysis complete!', aiAnalysis });
  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ message: 'Failed to analyze report.' });
  }
});

// ============================
// DELETE ROUTE
// ============================
router.delete('/:abhaId/:reportId', protect, admin, async (req, res) => {
  try {
    await dbConnect();

    const { abhaId, reportId } = req.params;
    const patient = await Patient.findOne({ abhaId });
    if (!patient) return res.status(404).json({ message: 'Patient not found.' });

    const report = patient.reportsAndScans.id(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    // delete asset from Cloudinary if present
    if (report.filePublicId) {
      try {
        await cloudinary.uploader.destroy(report.filePublicId, {
          resource_type: 'auto',
          invalidate: true,
        });
      } catch (e) {
        // Log but do not fail deletion if Cloudinary is unreachable
        console.error('Cloudinary destroy error:', e?.message || e);
      }
    }

    report.remove();
    await patient.save();

    res.status(200).json({ message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error while deleting report.' });
  }
});

module.exports = router;
