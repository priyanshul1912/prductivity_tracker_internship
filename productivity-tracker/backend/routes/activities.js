const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

// Log activity
router.post('/', auth, async (req, res) => {
  try {
    const activity = new Activity({ ...req.body, user: req.user._id });
    await activity.save();

    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('activity_logged', activity);
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get activities
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, type, limit = 50 } = req.query;
    const query = { user: req.user._id };
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    if (type) query.type = type;

    const activities = await Activity.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit));
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update activity (end time)
router.put('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get app usage summary
router.get('/app-usage/summary', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const usage = await Activity.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'app_usage',
          startTime: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: '$name',
          totalDuration: { $sum: '$duration' },
          category: { $first: '$category' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalDuration: -1 } },
      { $limit: 10 }
    ]);
    res.json(usage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
