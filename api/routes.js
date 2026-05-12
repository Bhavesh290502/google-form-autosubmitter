import express from 'express';
import multer from 'multer';
import { parseGoogleForm } from '../services/formParser.js';
import { submitSingle } from '../services/submissionEngine.js';
import { processBulk } from '../services/queueManager.js';
import { getRecentLogs } from '../utils/logger.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @route POST /api/parse-form
 * @desc Parse a Google Form URL to extract fields
 */
router.post('/parse-form', async (req, res) => {
  try {
    const { formUrl } = req.body;
    if (!formUrl) return res.status(400).json({ error: 'Form URL is required' });

    const formData = await parseGoogleForm(formUrl);
    res.json({ success: true, data: formData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/submit
 * @desc Submit a single entry
 */
router.post('/submit', async (req, res) => {
  try {
    const { formUrl, formData, usePuppeteer } = req.body;
    if (!formUrl || !formData) return res.status(400).json({ error: 'Form URL and data are required' });

    const result = await submitSingle(formUrl, formData, usePuppeteer);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/bulk-submit
 * @desc Upload CSV for bulk submission
 */
router.post('/bulk-submit', upload.single('csvFile'), async (req, res) => {
  try {
    const { formUrl, fieldMapping } = req.body;
    if (!req.file || !formUrl || !fieldMapping) {
      return res.status(400).json({ error: 'File, formUrl, and fieldMapping required' });
    }

    // Process bulk async
    const mapping = JSON.parse(fieldMapping);
    processBulk(formUrl, req.file.path, mapping);
    
    res.json({ success: true, message: 'Bulk submission started.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/status
 * @desc Get system status
 */
router.get('/status', (req, res) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() });
});

/**
 * @route GET /api/logs
 * @desc Get recent submission logs
 */
router.get('/logs', (req, res) => {
  try {
    const logs = getRecentLogs();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
