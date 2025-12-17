const session = require('express-session');

// Простая настройка сессий (без кастомного store)
// В продакшене рекомендуется использовать Redis или подобное
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // В продакшене установить true для HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
};

module.exports = session(sessionConfig);
