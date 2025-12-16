import express from 'express';
import { registerDevice, listDevices, ingestData, deleteDevice } from '../controllers/devicesController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Register device (admin only)
router.post('/register', protect, authorize('admin'), registerDevice);
router.get('/', protect, authorize('admin'), listDevices);
router.delete('/:id', protect, authorize('admin'), deleteDevice);

// Public ingest endpoint for devices
router.post('/ingest', ingestData);

export default router;
