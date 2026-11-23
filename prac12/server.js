require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET environment variable is required');
}

app.use(express.json());
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static('public'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`StudyMate running at http://localhost:${port}`);
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studymate')
  .then(() => console.log('MongoDB connected; data will be stored persistently.'))
  .catch(err => console.warn(`MongoDB unavailable; using temporary in-memory data: ${err.message}`));
