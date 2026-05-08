const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const WorkSession = require('../models/WorkSession');
const User = require('../models/User');

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);
    res.json({ tasks, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, user: req.user._id });
    await task.save();
    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('task_created', task);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.body.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
      await task.save();
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'productivity.totalTasksCompleted': 1 }
      });
    }

    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('task_updated', task);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get task stats
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, completed, inProgress, overdue, todayCompleted] = await Promise.all([
      Task.countDocuments({ user: req.user._id }),
      Task.countDocuments({ user: req.user._id, status: 'completed' }),
      Task.countDocuments({ user: req.user._id, status: 'in_progress' }),
      Task.countDocuments({ user: req.user._id, status: { $ne: 'completed' }, dueDate: { $lt: new Date() } }),
      Task.countDocuments({ user: req.user._id, status: 'completed', completedAt: { $gte: today } })
    ]);

    res.json({ total, completed, inProgress, overdue, todayCompleted });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
