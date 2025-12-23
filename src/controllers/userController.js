const { UserModel } = require('../database/database');
const { deleteAvatarFile } = require('../utils/fileUtils');

class UserController {
  // Получить всех пользователей (защищенный маршрут)
  static getAllUsers(req, res) {
    UserModel.findAll()
      .then(users => {
        console.log('Users in DB:', users);
        res.json({ users });
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  }

  // Получить всех пользователей для галереи (публичный маршрут, без паролей)
  static getAllUsersPublic(req, res) {
    UserModel.findAll()
      .then(users => {
        // Убираем чувствительную информацию
        const publicUsers = users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          created_at: user.created_at
        }));
        res.json({ users: publicUsers });
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
    const validRoles = ['Покупатель', 'Редактор', 'Админ', 'Admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль. Допустимые роли: Покупатель, Редактор, Админ, Admin' });
    }

    const userData = {
      username,
      email,
      password,
      avatar: avatar || '/images/woman.png',
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

    console.log('Update user request:', { id, username, email, avatar, role });
    console.log('Files:', req.files);

    // Сначала проверим, существует ли пользователь
    UserModel.findById(id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: 'Пользователь не найден' });
        }

        if (!username || !email) {
          return res.status(400).json({ error: 'Имя пользователя и email обязательны' });
        }

        // Проверка роли
        const validRoles = ['Покупатель', 'Редактор', 'Админ', 'Admin'];
        if (role && !validRoles.includes(role)) {
          return res.status(400).json({ error: 'Недопустимая роль. Допустимые роли: Покупатель, Редактор, Админ, Admin' });
        }

        // Если загружен файл, используем его путь, иначе используем avatar из тела
        let avatarPath = avatar;
        let oldAvatarPath = null;

        if (req.files && req.files.length > 0) {
          // Найдем файл с именем 'avatar'
          const avatarFile = req.files.find(file => file.fieldname === 'avatar');
          if (avatarFile) {
            avatarPath = `/utImages/${avatarFile.filename}`;
            // Сохраняем старый путь аватара для удаления
            oldAvatarPath = user.avatar;
            console.log('Avatar file saved:', avatarPath);
          }
        }

        const updateData = {
          username,
          email,
          password: password || undefined,
          avatar: avatarPath !== undefined ? avatarPath : undefined,
          role: role || undefined
        };

        console.log('Update data:', updateData);

        UserModel.update(id, updateData)
          .then(result => {
            if (result.changes === 0) {
              return res.status(404).json({ error: 'Пользователь не найден' });
            }

            // Удаляем старый аватар, если был загружен новый файл
            if (oldAvatarPath && avatarPath !== oldAvatarPath) {
              deleteAvatarFile(oldAvatarPath);
            }

            // Получить обновленные данные пользователя
            UserModel.findById(id)
              .then(updatedUser => {
                if (!updatedUser) {
                  return res.status(404).json({ error: 'Пользователь не найден после обновления' });
                }

                res.json({
                  message: 'Пользователь обновлен',
                  user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    avatar: updatedUser.avatar
                  }
                });
              })
              .catch(err => {
                console.error('Find updated user error:', err);
                res.status(500).json({ error: err.message });
              });
          })
          .catch(err => {
            console.error('Update error:', err);
            res.status(500).json({ error: err.message });
          });
      })
      .catch(err => {
        console.error('Find user error:', err);
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

    // Сначала получаем данные пользователя, чтобы узнать путь к аватару
    UserModel.findById(userId)
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Удаляем аватар пользователя (если он не по умолчанию)
        const avatarDeletionPromise = deleteAvatarFile(user.avatar);

        // Удаляем пользователя из базы данных
        const userDeletionPromise = UserModel.delete(userId);

        // Ждем завершения обеих операций
        Promise.all([avatarDeletionPromise, userDeletionPromise])
          .then(([avatarDeleted, result]) => {
            if (result.changes === 0) {
              return res.status(404).json({ error: 'Пользователь не найден' });
            }

            console.log('User deleted, avatar deletion result:', avatarDeleted);
            res.json({ message: 'Пользователь удален' });
          })
          .catch(err => {
            console.error('Error during user deletion:', err);
            res.status(500).json({ error: err.message });
          });
      })
      .catch(err => {
        console.error('Error finding user for deletion:', err);
        res.status(500).json({ error: err.message });
      });
  }
}

module.exports = UserController;
