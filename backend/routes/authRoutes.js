const express = require('express');
const protect = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  savePushToken,
  removePushToken,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/push-token', protect, savePushToken);
router.delete('/push-token', protect, removePushToken);

module.exports = router;
