import express from 'express';
import {
  saveSensorData,
  getSensorHistory,
  bulkSaveSensorData,
  deleteSensorHistory
} from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getSensorHistory)
  .post(saveSensorData)
  .delete(deleteSensorHistory);

router.post('/bulk', bulkSaveSensorData);

export default router;
