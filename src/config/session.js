const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

// Настройка сессий с SQLite хранилищем
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  store: new SQLiteStore({
    db: 'database.db',
    dir: __dirname + '/../../',
    table: 'sessions'
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // В продакшене установить true для HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
};

module.exports = session(sessionConfig);
