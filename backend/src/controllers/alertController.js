import Alert from '../models/Alert.js';

// @desc    Get user alerts
// @route   GET /api/alerts
// @access  Private
export const getAlerts = async (req, res) => {
  try {
    const { resolved, limit = 100, type } = req.query;

    const query = { userId: req.user.id };

    if (resolved !== undefined) {
      query.resolved = resolved === 'true';
    }

    if (type) {
      query.type = type;
    }

    const alerts = await Alert
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

// @desc    Create alert
// @route   POST /api/alerts
// @access  Private
export const createAlert = async (req, res) => {
  try {
    const { type, severity, message, value, threshold } = req.body;

    if (!type || !message || value === undefined || threshold === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, message, value, and threshold'
      });
    }

    const alert = await Alert.create({
      userId: req.user.id,
      type,
      severity: severity || 'medium',
      message,
      value,
      threshold
    });

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
export const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { resolved: true, resolvedAt: Date.now() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved',
      data: alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private
export const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert deleted'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message
    });
  }
};
