import express from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get settings - all authenticated users
router.get('/', getSettings);

// Update settings - admin only
router.put('/', authorize('admin'), updateSettings);

// Reset settings - admin only
router.post('/reset', authorize('admin'), resetSettings);

export default router;
