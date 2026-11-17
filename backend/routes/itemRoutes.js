const express = require('express');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getItems,
  getMyItems,
  getItem,
  createItem,
  resolveItem,
  deleteItem,
  uploadSignature,
} = require('../controllers/itemController');

const router = express.Router();

// Only logged-in students can use the app
router.use(protect);

router.get('/', getItems);
router.get('/mine', getMyItems); // these two must be before "/:id"
router.get('/upload-signature', uploadSignature);
router.get('/:id', getItem);
router.post('/', upload.single('image'), createItem);
router.patch('/:id/resolve', resolveItem);
router.delete('/:id', deleteItem);

module.exports = router;
