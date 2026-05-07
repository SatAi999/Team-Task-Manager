const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, restrictTo('ADMIN'), getUsers);

module.exports = router;
