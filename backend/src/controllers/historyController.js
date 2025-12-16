import SensorHistory from '../models/SensorHistory.js';

// @desc    Save sensor data
// @route   POST /api/history
// @access  Private
export const saveSensorData = async (req, res) => {
  try {
    const { gas, temp, humidity, fanStatus, buzzerStatus, timestamp, deviceId } = req.body;

    // Validate required fields
    if (gas === undefined || temp === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide gas, temp, and humidity values'
      });
    }

    const sensorData = await SensorHistory.create({
      userId: req.user.id,
      gas,
      temp,
      humidity,
      fanStatus: fanStatus !== undefined ? fanStatus : false,
      buzzerStatus: buzzerStatus !== undefined ? buzzerStatus : false,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      deviceId: deviceId || 'default-device'
    });

    res.status(201).json({
      success: true,
      message: 'Sensor data saved successfully',
      data: sensorData
    });
  } catch (error) {
    console.error('Save sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving sensor data',
      error: error.message
    });
  }
};

// @desc    Get sensor history
// @route   GET /api/history
// @access  Private
export const getSensorHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit = 1000, deviceId } = req.query;

    // Build query
    const query = { userId: req.user.id };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Add device filter if provided
    if (deviceId) {
      query.deviceId = deviceId;
    }

    const history = await SensorHistory
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Get sensor history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sensor history',
      error: error.message
    });
  }
};

// @desc    Bulk save sensor data
// @route   POST /api/history/bulk
// @access  Private
export const bulkSaveSensorData = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of sensor data'
      });
    }

    // Add userId to each record
    const recordsWithUser = data.map(record => ({
      ...record,
      userId: req.user.id,
      timestamp: record.timestamp ? new Date(record.timestamp) : new Date()
    }));

    const savedData = await SensorHistory.insertMany(recordsWithUser);

    res.status(201).json({
      success: true,
      message: `${savedData.length} records saved successfully`,
      data: savedData
    });
  } catch (error) {
    console.error('Bulk save sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving sensor data',
      error: error.message
    });
  }
};

// @desc    Delete sensor history
// @route   DELETE /api/history
// @access  Private
export const deleteSensorHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { userId: req.user.id };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const result = await SensorHistory.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} records deleted successfully`
    });
  } catch (error) {
    console.error('Delete sensor history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sensor history',
      error: error.message
    });
  }
};
