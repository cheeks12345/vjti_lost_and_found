const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics',
  'ID Card',
  'Wallet',
  'Keys',
  'Books',
  'Bag',
  'Bottle',
  'Clothing',
  'Accessories',
  'Other',
];

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    location: { type: String, required: true, trim: true, maxlength: 100 }, // e.g. "Library 2nd floor"
    date: { type: Date, default: Date.now }, // when it was lost / found
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Fast feed queries: newest open items of a type
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ postedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
