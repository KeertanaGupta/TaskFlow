const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true,
    default: ''
  },
  importance: {
    type: Number,
    required: [true, 'Importance is required'],
    validate: {
      validator: Number.isInteger,
      message: 'Importance must be an integer'
    },
    min: [1, 'Importance must be between 1 and 5'],
    max: [5, 'Importance must be between 1 and 5']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed'],
      message: 'Status must be pending or completed'
    },
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Configure JSON and Object output so virtuals are serialized but not stored in DB
TaskSchema.set('toJSON', { virtuals: true });
TaskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', TaskSchema);
