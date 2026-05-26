const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Priority score calculation utility
const calculatePriorityScore = (task) => {
  if (task.status === 'completed') {
    return 0;
  }
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const diffTime = dueDate - now;
  const daysUntilDue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const effectiveDays = Math.max(daysUntilDue, 1);
  const score = (task.importance * 10) + (100 / effectiveDays);
  return Math.round(score * 100) / 100;
};

// 1. GET /bfhl/tasks/stats (MUST define BEFORE GET /bfhl/tasks/:id)
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const stats = await Task.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                completedTasks: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                averageImportance: { $avg: "$importance" },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "pending"] },
                          { $lt: ["$dueDate", now] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          importanceCounts: [
            {
              $group: {
                _id: "$importance",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const defaultStats = {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      averageImportance: 0,
      overdueTasks: 0,
      tasksByImportance: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    };

    if (!stats || stats.length === 0 || stats[0].totals.length === 0) {
      return res.status(200).json(defaultStats);
    }

    const totals = stats[0].totals[0];
    const importanceCounts = stats[0].importanceCounts;

    const tasksByImportance = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    importanceCounts.forEach(item => {
      if (item._id >= 1 && item._id <= 5) {
        tasksByImportance[item._id.toString()] = item.count;
      }
    });

    res.status(200).json({
      totalTasks: totals.totalTasks || 0,
      pendingTasks: totals.pendingTasks || 0,
      completedTasks: totals.completedTasks || 0,
      averageImportance: totals.averageImportance ? Math.round(totals.averageImportance * 100) / 100 : 0,
      overdueTasks: totals.overdueTasks || 0,
      tasksByImportance
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error while calculating statistics' });
  }
});

// 2. GET /bfhl/tasks (List tasks, sorted by priorityScore descending, support status & minImportance query filters)
router.get('/', async (req, res) => {
  try {
    const { status, minImportance } = req.query;
    const query = {};

    if (status === 'pending' || status === 'completed') {
      query.status = status;
    }

    if (minImportance !== undefined) {
      const minImp = parseInt(minImportance, 10);
      if (!isNaN(minImp)) {
        query.importance = { $gte: minImp };
      }
    }

    const tasks = await Task.find(query);

    // Compute priorityScore on read and sort descending
    const tasksWithScore = tasks.map(task => {
      const taskObj = task.toObject();
      taskObj.priorityScore = calculatePriorityScore(taskObj);
      return taskObj;
    });

    tasksWithScore.sort((a, b) => b.priorityScore - a.priorityScore);

    res.status(200).json(tasksWithScore);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Server error while fetching tasks' });
  }
});

// 3. POST /bfhl/tasks (Create a new task)
router.post('/', async (req, res) => {
  try {
    const { title, description, importance, dueDate, status } = req.body;

    // Explicit validations
    if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
      return res.status(400).json({ error: 'Title is required and must be between 3 and 100 characters' });
    }

    if (description !== undefined && description !== null && typeof description === 'string' && description.length > 500) {
      return res.status(400).json({ error: 'Description must be under 500 characters' });
    }

    if (importance === undefined || importance === null) {
      return res.status(400).json({ error: 'Importance is required' });
    }
    const impNum = Number(importance);
    if (!Number.isInteger(impNum) || impNum < 1 || impNum > 5) {
      return res.status(400).json({ error: 'Importance must be an integer between 1 and 5' });
    }

    if (!dueDate) {
      return res.status(400).json({ error: 'Due date is required' });
    }
    const dueTime = new Date(dueDate);
    if (isNaN(dueTime.getTime())) {
      return res.status(400).json({ error: 'Due date must be a valid date' });
    }
    if (dueTime <= new Date()) {
      return res.status(400).json({ error: 'Due date must be in the future at time of creation' });
    }

    if (status && !['pending', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be pending or completed' });
    }

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      importance: impNum,
      dueDate: dueTime,
      status: status || 'pending'
    });

    await newTask.save();

    const taskObj = newTask.toObject();
    taskObj.priorityScore = calculatePriorityScore(taskObj);

    res.status(201).json(taskObj);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: error.message || 'Validation or Server Error' });
  }
});

// 4. GET /bfhl/tasks/:id (Fetch single task by ID)
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const taskObj = task.toObject();
    taskObj.priorityScore = calculatePriorityScore(taskObj);
    res.status(200).json(taskObj);
  } catch (error) {
    console.error('Error fetching task:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. PATCH /bfhl/tasks/:id (Update task subset)
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, importance, dueDate, status } = req.body;
    const updateFields = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100) {
        return res.status(400).json({ error: 'Title must be between 3 and 100 characters' });
      }
      updateFields.title = title.trim();
    }

    if (description !== undefined) {
      if (description !== null && typeof description === 'string' && description.length > 500) {
        return res.status(400).json({ error: 'Description must be under 500 characters' });
      }
      updateFields.description = description ? description.trim() : '';
    }

    if (importance !== undefined) {
      const impNum = Number(importance);
      if (!Number.isInteger(impNum) || impNum < 1 || impNum > 5) {
        return res.status(400).json({ error: 'Importance must be an integer between 1 and 5' });
      }
      updateFields.importance = impNum;
    }

    if (dueDate !== undefined) {
      if (!dueDate) {
        return res.status(400).json({ error: 'Due date cannot be empty' });
      }
      const dueTime = new Date(dueDate);
      if (isNaN(dueTime.getTime())) {
        return res.status(400).json({ error: 'Due date must be a valid date' });
      }
      if (dueTime <= new Date()) {
        return res.status(400).json({ error: 'Due date must be in the future' });
      }
      updateFields.dueDate = dueTime;
    }

    if (status !== undefined) {
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be pending or completed' });
      }
      updateFields.status = status;
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    Object.assign(task, updateFields);
    await task.save();

    const taskObj = task.toObject();
    taskObj.priorityScore = calculatePriorityScore(taskObj);

    res.status(200).json(taskObj);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }
    res.status(400).json({ error: error.message || 'Server Error' });
  }
});

// 6. DELETE /bfhl/tasks/:id (Delete task by ID)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
