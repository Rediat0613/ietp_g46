import express from 'express';
import {
  getAlerts,
  createAlert,
  resolveAlert,
  deleteAlert
} from '../controllers/alertController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAlerts)
  .post(createAlert);

router.put('/:id/resolve', resolveAlert);
router.delete('/:id', deleteAlert);

export default router;
