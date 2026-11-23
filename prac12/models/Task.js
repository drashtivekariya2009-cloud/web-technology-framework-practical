const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  dueDate: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Task', taskSchema);
