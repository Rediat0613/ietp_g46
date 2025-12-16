import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Device from '../models/Device.js';
import SensorHistory from '../models/SensorHistory.js';

// Admin registers a device and receives deviceId + secret (secret only shown once)
export const registerDevice = async (req, res) => {
  try {
    const { name, owner } = req.body;

    const deviceId = crypto.randomBytes(6).toString('hex');
    const rawSecret = crypto.randomBytes(24).toString('hex');
    const secretHash = await bcrypt.hash(rawSecret, 10);

    const device = await Device.create({ deviceId, name, owner: owner || null, secretHash });

    res.status(201).json({
      success: true,
      message: 'Device registered',
      data: {
        deviceId: device.deviceId,
        secret: rawSecret
      }
    });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({ success: false, message: 'Error registering device', error: error.message });
  }
};

// List devices (admin)
export const listDevices = async (req, res) => {
  try {
    const devices = await Device.find().select('-secretHash');
    res.status(200).json({ success: true, data: devices });
  } catch (error) {
    console.error('List devices error:', error);
    res.status(500).json({ success: false, message: 'Error fetching devices', error: error.message });
  }
};

// Ingest sensor data from deviceKey header (public endpoint)
export const ingestData = async (req, res) => {
  try {
    // Expect x-device-key header in format deviceId:secret
    const header = req.headers['x-device-key'] || req.headers['x-device-key'.toLowerCase()];
    if (!header) {
      return res.status(401).json({ success: false, message: 'Missing device key' });
    }

    const [deviceId, secret] = String(header).split(':');
    if (!deviceId || !secret) {
      return res.status(400).json({ success: false, message: 'Invalid device key format' });
    }

    const device = await Device.findOne({ deviceId });
    if (!device || device.disabled) {
      return res.status(401).json({ success: false, message: 'Invalid device' });
    }

    const ok = await bcrypt.compare(secret, device.secretHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid device credentials' });
    }

    // Validate payload similar to historyController
    const { gas, temp, humidity, fanStatus, buzzerStatus, timestamp, deviceId: bodyDeviceId } = req.body;
    if (gas === undefined || temp === undefined || humidity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide gas, temp, and humidity values' });
    }

    const userId = req.body.userId ? String(req.body.userId).trim() : (device.owner || undefined);

    const sensorData = await SensorHistory.create({
      userId: userId || undefined,
      gas,
      temp,
      humidity,
      fanStatus: fanStatus !== undefined ? fanStatus : false,
      buzzerStatus: buzzerStatus !== undefined ? buzzerStatus : false,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      deviceId: bodyDeviceId || device.deviceId
    });

    res.status(201).json({ success: true, message: 'Sensor data ingested', data: sensorData });
  } catch (error) {
    console.error('Device ingest error:', error);
    res.status(500).json({ success: false, message: 'Error ingesting data', error: error.message });
  }
};

// Disable or delete device
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findOneAndDelete({ deviceId: id });
    if (!device) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    res.status(200).json({ success: true, message: 'Device deleted' });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ success: false, message: 'Error deleting device', error: error.message });
  }
};
