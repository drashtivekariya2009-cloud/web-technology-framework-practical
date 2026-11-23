const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();
const memoryUsers = new Map();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Please enter username and password.' });
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,12}$/.test(password))
      return res.status(400).json({ message: 'Password must be 8 to 12 characters and include uppercase, lowercase, and a special character.' });
    const name = username.trim();
    const databaseConnected = mongoose.connection.readyState === 1;
    const existingUser = databaseConnected
      ? await User.findOne({ username: name })
      : memoryUsers.has(name);
    if (existingUser) return res.status(409).json({ message: 'This username already exists. Please choose another one.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    if (databaseConnected) {
      await User.create({ username: name, password: hashedPassword });
    } else {
      memoryUsers.set(name, hashedPassword);
    }
    req.session.username = name;
    res.json({ username: name });
  } catch (err) { res.status(500).json({ message: 'Could not create account.' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const name = (username || '').trim();
    const databaseConnected = mongoose.connection.readyState === 1;
    const user = databaseConnected
      ? await User.findOne({ username: name })
      : memoryUsers.has(name) ? { username: name, password: memoryUsers.get(name) } : null;
    if (!user || !await bcrypt.compare(password || '', user.password)) return res.status(401).json({ message: 'Invalid username or password.' });
    req.session.username = user.username;
    res.json({ username: user.username });
  } catch (err) { res.status(500).json({ message: 'Login failed.' }); }
});
router.get('/me', (req, res) => req.session.username ? res.json({ username: req.session.username }) : res.status(401).json({ message: 'Not logged in.' }));
router.post('/logout', (req, res) => req.session.destroy(() => { res.clearCookie('connect.sid'); res.json({ message: 'Logged out.' }); }));
module.exports = router;
