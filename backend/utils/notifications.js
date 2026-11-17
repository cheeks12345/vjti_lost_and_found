const User = require('../models/User');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Send a push notification about a new item to every student except the poster
const notifyAllUsers = async (item, posterId) => {
  const users = await User.find({ _id: { $ne: posterId }, pushToken: { $ne: null } }).select('pushToken');
  const tokens = [...new Set(users.map((u) => u.pushToken))];
  if (tokens.length === 0) return;

  const title = item.type === 'lost' ? `🔍 Lost: ${item.title}` : `📦 Found: ${item.title}`;
  const body = `Near ${item.location}. Tap to see details.`;

  const messages = tokens.map((to) => ({
    to,
    sound: 'default',
    title,
    body,
    data: { itemId: item._id.toString() },
  }));

  // Expo accepts max 100 messages per request
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      });
      const json = await res.json();

      // Remove tokens of uninstalled apps so we stop sending to them
      if (Array.isArray(json.data)) {
        const dead = json.data
          .map((r, idx) => (r.status === 'error' && r.details?.error === 'DeviceNotRegistered' ? chunk[idx].to : null))
          .filter(Boolean);
        if (dead.length) await User.updateMany({ pushToken: { $in: dead } }, { $set: { pushToken: null } });
      }
    } catch (err) {
      console.error('Push notification error:', err.message);
    }
  }
};

module.exports = { notifyAllUsers };
