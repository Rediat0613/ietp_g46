import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['gas', 'temperature', 'humidity'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
alertSchema.index({ userId: 1, timestamp: -1 });
alertSchema.index({ resolved: 1 });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
