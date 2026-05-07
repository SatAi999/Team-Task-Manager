const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { taskValidation } = require('../validations');

router.use(protect);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', restrictTo('ADMIN'), taskValidation, validate, createTask);
router.put('/:id', updateTask);
router.delete('/:id', restrictTo('ADMIN'), deleteTask);

module.exports = router;
