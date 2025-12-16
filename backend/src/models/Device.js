import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: 'Unnamed Device'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  secretHash: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Device = mongoose.model('Device', deviceSchema);

export default Device;
