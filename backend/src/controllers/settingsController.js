import Settings from '../models/Settings.js';

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.id });

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        userId: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private (Admin only)
export const updateSettings = async (req, res) => {
  try {
    const { thresholds, alertDuration, fanMinOnTime } = req.body;

    let settings = await Settings.findOne({ userId: req.user.id });

    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create({
        userId: req.user.id,
        thresholds,
        alertDuration,
        fanMinOnTime
      });
    } else {
      // Update existing settings
      if (thresholds) {
        settings.thresholds = {
          ...settings.thresholds,
          ...thresholds
        };
      }
      if (alertDuration !== undefined) {
        settings.alertDuration = alertDuration;
      }
      if (fanMinOnTime !== undefined) {
        settings.fanMinOnTime = fanMinOnTime;
      }

      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private (Admin only)
export const resetSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user.id },
      {
        thresholds: {
          gas: 300,
          temperature: 30,
          humidityMin: 40,
          humidityMax: 70
        },
        alertDuration: 5,
        fanMinOnTime: 1
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Settings reset to default',
      data: settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting settings',
      error: error.message
    });
  }
};
