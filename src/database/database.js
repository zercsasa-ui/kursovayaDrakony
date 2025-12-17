const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Подключение к SQLite базе данных
const dbPath = path.join(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Подключено к SQLite базе данных');
    initializeDatabase();
  }
});

// Инициализация базы данных
function initializeDatabase() {
  // Таблица пользователей
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Таблица сессий (для express-session)
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  )`);

  // Индексы для оптимизации
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire)`);

  console.log('База данных инициализирована');
}

// Функции для работы с пользователями
const UserModel = {
  // Найти пользователя по ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Найти пользователя по имени пользователя
  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Найти пользователя по email
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Создать нового пользователя
  create: (userData) => {
    return new Promise((resolve, reject) => {
      const { username, email, password, role = 'user' } = userData;
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, password, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...userData });
        }
      );
    });
  },

  // Получить всех пользователей
  findAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, username, email, role, created_at FROM users', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Обновить пользователя
  update: (id, userData) => {
    return new Promise((resolve, reject) => {
      const { username, email, password, role } = userData;
      const updateData = [];
      let query = 'UPDATE users SET ';

      if (username !== undefined) {
        query += 'username = ?, ';
        updateData.push(username);
      }
      if (email !== undefined) {
        query += 'email = ?, ';
        updateData.push(email);
      }
      if (password !== undefined) {
        query += 'password = ?, ';
        updateData.push(password);
      }
      if (role !== undefined) {
        query += 'role = ?, ';
        updateData.push(role);
      }

      query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      updateData.push(id);

      db.run(query, updateData, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  // Удалить пользователя
  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
};

// Функции для работы с сессиями
const SessionModel = {
  // Получить сессию
  get: (sid) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT sess FROM sessions WHERE sid = ?', [sid], (err, row) => {
        if (err) reject(err);
        else resolve(row ? JSON.parse(row.sess) : null);
      });
    });
  },

  // Сохранить сессию
  set: (sid, sess, expire) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO sessions (sid, sess, expire) VALUES (?, ?, ?)',
        [sid, JSON.stringify(sess), expire],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  // Удалить сессию
  destroy: (sid) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM sessions WHERE sid = ?', [sid], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Ошибка закрытия базы данных:', err.message);
    } else {
      console.log('База данных закрыта');
    }
    process.exit(0);
  });
});

module.exports = {
  db,
  UserModel,
  SessionModel
};
