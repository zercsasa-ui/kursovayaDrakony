const db = require('../database/database');

class UserController {
  // Получить всех пользователей
  static getAllUsers(req, res) {
    db.all('SELECT id, username, email, created_at FROM users', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ users: rows });
    });
  }

  // Создать нового пользователя
  static createUser(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, message: 'Пользователь создан' });
      });
  }

  // Получить пользователя по ID
  static getUserById(req, res) {
    const { id } = req.params;

    db.get('SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id],
      (err, user) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (user) {
          res.json({ user });
        } else {
          res.status(404).json({ error: 'Пользователь не найден' });
        }
      });
  }

  // Обновить пользователя
  static updateUser(req, res) {
    const { id } = req.params;
    const { username, email, password } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Имя пользователя и email обязательны' });
    }

    const updateData = [username, email, id];
    let query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';

    if (password) {
      query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
      updateData.splice(2, 0, password);
    }

    db.run(query, updateData, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Пользователь не найден' });
      } else {
        res.json({ message: 'Пользователь обновлен' });
      }
    });
  }

  // Удалить пользователя
  static deleteUser(req, res) {
    const { id } = req.params;

    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Пользователь не найден' });
      } else {
        res.json({ message: 'Пользователь удален' });
      }
    });
  }
}

module.exports = UserController;
