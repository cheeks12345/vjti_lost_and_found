const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, phone: u.phone });

const isAllowedEmail = (email) => {
  const domain = (process.env.ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase();
  if (!domain) return true;
  // allows name@vjti.ac.in and name@ce.vjti.ac.in
  return email.endsWith('@' + domain) || email.endsWith('.' + domain);
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, password, phone } = req.body;
  const email = (req.body.email || '').trim().toLowerCase();

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (!isAllowedEmail(email)) {
    return res.status(400).json({ message: `Please use your college email (${process.env.ALLOWED_EMAIL_DOMAIN})` });
  }
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, phone });

  res.status(201).json({ token: createToken(user._id), user: publicUser(user) });
};

// POST /api/auth/login
const login = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: createToken(user._id), user: publicUser(user) });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

// PUT /api/auth/push-token  { token }
const savePushToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  // One phone = one account, so remove this token from anyone else
  await User.updateMany({ pushToken: token, _id: { $ne: req.user._id } }, { $set: { pushToken: null } });
  req.user.pushToken = token;
  await req.user.save();

  res.json({ message: 'Notifications enabled' });
};

// DELETE /api/auth/push-token  (on logout)
const removePushToken = async (req, res) => {
  req.user.pushToken = null;
  await req.user.save();
  res.json({ message: 'Notifications disabled' });
};

module.exports = { register, login, getMe, savePushToken, removePushToken };
