const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();
const memoryTasks = new Map();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return res.json(await Task.find({ username: req.session.username }).sort({ createdAt: 1 }));
    }

    res.json(memoryTasks.get(req.session.username) || []);
  } catch (e) {
    res.status(500).json({ message: 'Could not load tasks.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, subject, dueDate } = req.body;
    if (!name || !subject || !dueDate) return res.status(400).json({ message: 'Please fill all fields.' });

    if (mongoose.connection.readyState === 1) {
      const task = await Task.create({ username: req.session.username, name: name.trim(), subject: subject.trim(), dueDate });
      return res.status(201).json(task);
    }

    const userTasks = memoryTasks.get(req.session.username) || [];
    const task = {
      _id: new mongoose.Types.ObjectId().toString(),
      username: req.session.username,
      name: name.trim(),
      subject: subject.trim(),
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };
    userTasks.push(task);
    memoryTasks.set(req.session.username, userTasks);
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ message: 'Could not add task.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    let task;
    if (mongoose.connection.readyState === 1) {
      task = await Task.findOneAndUpdate({ _id: req.params.id, username: req.session.username }, { completed: !!req.body.completed }, { new: true });
    } else {
      const userTasks = memoryTasks.get(req.session.username) || [];
      task = userTasks.find(item => item._id === req.params.id);
      if (task) task.completed = !!req.body.completed;
    }

    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (e) {
    res.status(400).json({ message: 'Invalid task.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let task;
    if (mongoose.connection.readyState === 1) {
      task = await Task.findOneAndDelete({ _id: req.params.id, username: req.session.username });
    } else {
      const userTasks = memoryTasks.get(req.session.username) || [];
      const taskIndex = userTasks.findIndex(item => item._id === req.params.id);
      if (taskIndex !== -1) task = userTasks.splice(taskIndex, 1)[0];
    }

    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (e) {
    res.status(400).json({ message: 'Invalid task.' });
  }
});

module.exports = router;
