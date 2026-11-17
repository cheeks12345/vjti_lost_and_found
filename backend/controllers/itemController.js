const Item = require('../models/Item');
const {
  uploadImage,
  uploadBase64Image,
  deleteImage,
  getUploadSignature,
  isOwnCloudinaryUrl,
} = require('../config/cloudinary');
const { notifyAllUsers } = require('../utils/notifications');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/items?type=lost&category=Wallet&search=black&page=1
const getItems = async (req, res) => {
  const { type, category, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = 20;

  const filter = { status: 'open' };
  if (type === 'lost' || type === 'found') filter.type = type;
  if (category) filter.category = category;
  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: regex }, { description: regex }, { location: regex }];
  }

  const [items, total] = await Promise.all([
    Item.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('postedBy', 'name'),
    Item.countDocuments(filter),
  ]);

  res.json({ items, page, totalPages: Math.ceil(total / limit) });
};

// GET /api/items/mine
const getMyItems = async (req, res) => {
  const items = await Item.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
};

// GET /api/items/:id
const getItem = async (req, res) => {
  const item = await Item.findById(req.params.id).populate('postedBy', 'name email phone');
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json({ item });
};

// GET /api/items/upload-signature
// The app uses this to upload a photo straight to Cloudinary
const uploadSignature = (req, res) => {
  res.json(getUploadSignature());
};

// POST /api/items
// Image can come in 3 ways:
//  1. imageUrl + imagePublicId  -> app already uploaded it to Cloudinary (used by the app)
//  2. image as base64 data URI  -> server uploads it
//  3. multipart "image" file    -> server uploads it (handy for Postman)
const createItem = async (req, res) => {
  const { type, title, description, category, location, date, imageUrl, imagePublicId } = req.body;

  if (!type || !title || !location) {
    return res.status(400).json({ message: 'Type, title and location are required' });
  }

  let image = { url: '', publicId: '' };
  let result = null;
  if (imageUrl) {
    if (!isOwnCloudinaryUrl(imageUrl)) return res.status(400).json({ message: 'Invalid image URL' });
    image = { url: imageUrl, publicId: imagePublicId || '' };
  } else if (req.file) {
    result = await uploadImage(req.file.buffer);
  } else if (typeof req.body.image === 'string' && req.body.image.startsWith('data:image/')) {
    result = await uploadBase64Image(req.body.image);
  }
  if (result) image = { url: result.secure_url, publicId: result.public_id };

  const item = await Item.create({
    type,
    title,
    description,
    category,
    location,
    date: date || Date.now(),
    image,
    postedBy: req.user._id,
  });

  res.status(201).json({ item });

  // Notify everyone in the background (don't make the poster wait)
  notifyAllUsers(item, req.user._id).catch((err) => console.error(err));
};

// PATCH /api/items/:id/resolve
const resolveItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (!item.postedBy.equals(req.user._id)) {
    return res.status(403).json({ message: 'You can only update your own posts' });
  }

  item.status = 'resolved';
  await item.save();
  res.json({ item });
};

// DELETE /api/items/:id
const deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (!item.postedBy.equals(req.user._id)) {
    return res.status(403).json({ message: 'You can only delete your own posts' });
  }

  if (item.image.publicId) {
    await deleteImage(item.image.publicId).catch(() => {});
  }
  await item.deleteOne();
  res.json({ message: 'Post deleted' });
};

module.exports = { getItems, getMyItems, getItem, createItem, resolveItem, deleteItem, uploadSignature };
