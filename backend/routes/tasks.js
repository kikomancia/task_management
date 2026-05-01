const express = require('express');
const { ObjectId } = require('mongodb');
const { getTasksCollection } = require('../db');

const router = express.Router();

const validStatuses = ['todo', 'in-progress', 'done'];

router.get('/', async (req, res, next) => {
  try {
    const tasks = await getTasksCollection().find().sort({ createdAt: -1 }).toArray();
    res.json(tasks);
  } catch (error) {
    res.status(503).json({ message: 'Database unavailable: ' + error.message });
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description = '', status = 'todo', startDate = null, endDate = null } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }
    if (title.length > 255) {
      return res.status(400).json({ message: 'Title must be 255 characters or less.' });
    }
    if (description.length > 2000) {
      return res.status(400).json({ message: 'Description must be 2000 characters or less.' });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const timestamp = new Date();
    const task = {
      title: title.trim(),
      description: description.trim(),
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const result = await getTasksCollection().insertOne(task);
    res.status(201).json({ ...task, _id: result.insertedId });
  } catch (error) {
    res.status(503).json({ message: 'Database unavailable: ' + error.message });
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID.' });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const update = {
      $set: {
        status,
        updatedAt: new Date()
      }
    };

    const result = await getTasksCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(result.value);
  } catch (error) {
    res.status(503).json({ message: 'Database unavailable: ' + error.message });
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID.' });
    }

    const result = await getTasksCollection().findOneAndDelete({ _id: new ObjectId(id) });

    if (!result.value) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(result.value);
  } catch (error) {
    res.status(503).json({ message: 'Database unavailable: ' + error.message });
  }
});

module.exports = router;
