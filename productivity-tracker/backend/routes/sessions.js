const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkSession = require('../models/WorkSession');

// Start session
router.post('/start', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let session = await WorkSession.findOne({ user: req.user._id, date: today });
    if (!session) {
      session = new WorkSession({
        user: req.user._id,
        date: today,
        startTime: new Date()
      });
      await session.save();
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update session
router.put('/:id', auth, async (req, res) => {
  try {
    const session = await WorkSession.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('session_updated', session);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sessions
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const query = { user: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const sessions = await WorkSession.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get today's session
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const session = await WorkSession.findOne({ user: req.user._id, date: today });
    res.json(session || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Log break
router.post('/:id/break', auth, async (req, res) => {
  try {
    const { startTime, endTime, type } = req.body;
    const duration = Math.round((new Date(endTime) - new Date(startTime)) / 60000);

    const session = await WorkSession.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        $push: { breaks: { startTime, endTime, duration, type } },
        $inc: { totalBreakMinutes: duration }
      },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
