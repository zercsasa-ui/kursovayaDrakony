const { db, UserModel } = require('../database/database');

class AuthController {
  // Вход в систему
  static login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }

    // Используем UserModel для поиска пользователя
    UserModel.findByUsername(username)
      .then(user => {
        if (user && user.password === password) {
          req.session.userId = user.id;
          req.session.username = user.username;
          req.session.role = user.role;
          res.json({
            message: 'Вход выполнен',
            user: { id: user.id, username: user.username, role: user.role }
          });
        } else {
          res.status(401).json({ error: 'Неверные учетные данные' });
        }
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
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

  // Получить текущего пользователя из сессии
  static getCurrentUser(req, res) {
    if (req.session.userId) {
      UserModel.findById(req.session.userId)
        .then(user => {
          if (user) {
            res.json({
              success: true,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar
              }
            });
          } else {
            // Пользователь не найден в БД, очищаем сессию
            req.session.destroy();
            res.status(401).json({ error: 'Пользователь не найден' });
          }
        })
        .catch(err => {
          res.status(500).json({ error: err.message });
        });
    } else {
      res.status(401).json({ error: 'Не авторизован' });
    }
  }

  // Проверка статуса сессии
  static getSession(req, res) {
    if (req.session.userId) {
      res.json({
        authenticated: true,
        user: {
          id: req.session.userId,
          username: req.session.username,
          role: req.session.role
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  }

  // Проверка пароля текущего пользователя
  static verifyPassword(req, res) {
    const { password } = req.body;

    if (!req.session.userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Пароль обязателен' });
    }

    UserModel.findById(req.session.userId)
      .then(user => {
        if (user && user.password === password) {
          res.json({ success: true, message: 'Пароль верный' });
        } else {
          res.status(401).json({ error: 'Неверный пароль' });
        }
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  }
}

module.exports = AuthController;
