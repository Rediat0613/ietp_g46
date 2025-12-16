import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  thresholds: {
    gas: {
      type: Number,
      default: 300,
      min: 0,
      max: 1023
    },
    temperature: {
      type: Number,
      default: 30,
      min: 0,
      max: 100
    },
    humidityMin: {
      type: Number,
      default: 40,
      min: 0,
      max: 100
    },
    humidityMax: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    }
  },
  alertDuration: {
    type: Number,
    default: 5,
    min: 1,
    max: 60
  },
  fanMinOnTime: {
    type: Number,
    default: 1,
    min: 1,
    max: 60
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
