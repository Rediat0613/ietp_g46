import mongoose from 'mongoose';

const sensorHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gas: {
    type: Number,
    required: true
  },
  temp: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  fanStatus: {
    type: Boolean,
    required: true
  },
  buzzerStatus: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  deviceId: {
    type: String,
    default: 'default-device'
  }
});

// Index for faster queries
sensorHistorySchema.index({ userId: 1, timestamp: -1 });
sensorHistorySchema.index({ timestamp: -1 });

const SensorHistory = mongoose.model('SensorHistory', sensorHistorySchema);

export default SensorHistory;
