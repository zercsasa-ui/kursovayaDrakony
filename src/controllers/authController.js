const db = require('../database/database');

class AuthController {
  // Вход в систему
  static login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }

    db.get('SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, user) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        if (user) {
          req.session.userId = user.id;
          req.session.username = user.username;
          res.json({
            message: 'Вход выполнен',
            user: { id: user.id, username: user.username }
          });
        } else {
          res.status(401).json({ error: 'Неверные учетные данные' });
        }
      });
  }

  // Выход из системы
  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Выход выполнен' });
    });
  }

  // Проверка статуса сессии
  static getSession(req, res) {
    if (req.session.userId) {
      res.json({
        authenticated: true,
        user: { id: req.session.userId, username: req.session.username }
      });
    } else {
      res.json({ authenticated: false });
    }
  }
}

module.exports = AuthController;
