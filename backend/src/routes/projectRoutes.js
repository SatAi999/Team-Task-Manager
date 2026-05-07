const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateMembers,
} = require('../controllers/projectController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { projectValidation } = require('../validations');

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', restrictTo('ADMIN'), projectValidation, validate, createProject);
router.put('/:id', restrictTo('ADMIN'), projectValidation, validate, updateProject);
router.delete('/:id', restrictTo('ADMIN'), deleteProject);
router.put('/:id/members', restrictTo('ADMIN'), updateMembers);

module.exports = router;
