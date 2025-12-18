const { UserModel } = require('../database/database');

class UserController {
  // Получить всех пользователей
  static getAllUsers(req, res) {
    UserModel.findAll()
      .then(users => {
        res.json({ users });
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  }

  // Создать нового пользователя
  static createUser(req, res) {
    const { username, email, password, avatar, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Имя пользователя, email и пароль обязательны' });
    }

    // Проверка роли
    const validRoles = ['Покупатель', 'Редактор', 'Админ'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль. Допустимые роли: Покупатель, Редактор, Админ' });
    }

    const userData = {
      username,
      email,
      password,
      avatar: avatar || null,
      role: role || 'Покупатель'
    };

    UserModel.create(userData)
      .then(user => {
        // Сохраняем пользователя в сессии после успешной регистрации
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        res.json({
          id: user.id,
          message: 'Пользователь создан',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  }

  // Получить пользователя по ID
  static getUserById(req, res) {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Неверный ID пользователя' });
    }

    UserModel.findById(userId)
      .then(user => {
        if (user) {
          res.json({ user });
        } else {
          res.status(404).json({ error: 'Пользователь не найден' });
        }
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  }

  // Обновить пользователя
  static updateUser(req, res) {
    const { id } = req.params;
    const { username, email, password, avatar, role } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Имя пользователя и email обязательны' });
    }

    // Проверка роли
    const validRoles = ['Покупатель', 'Редактор', 'Админ'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль. Допустимые роли: Покупатель, Редактор, Админ' });
    }

    const updateData = {
      username,
      email,
      password: password || undefined,
      avatar: avatar !== undefined ? avatar : undefined,
      role: role || undefined
    };

    UserModel.update(id, updateData)
      .then(result => {
        if (result.changes === 0) {
          res.status(404).json({ error: 'Пользователь не найден' });
        } else {
          res.json({ message: 'Пользователь обновлен' });
        }
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  }

  // Удалить пользователя
  static deleteUser(req, res) {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Неверный ID пользователя' });
    }

    UserModel.delete(userId)
      .then(result => {
        if (result.changes === 0) {
          res.status(404).json({ error: 'Пользователь не найден' });
        } else {
          res.json({ message: 'Пользователь удален' });
        }
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  }
}

module.exports = UserController;
