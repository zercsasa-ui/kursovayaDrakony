// Middleware для проверки аутентификации
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Требуется аутентификация' });
  }
}

// Middleware для проверки роли администратора
function requireAdmin(req, res, next) {
  if (req.session.userId && req.session.role === 'Админ') {
    next();
  } else {
    res.status(403).json({ error: 'Требуются права администратора' });
  }
}

module.exports = {
  requireAuth,
  requireAdmin
};
