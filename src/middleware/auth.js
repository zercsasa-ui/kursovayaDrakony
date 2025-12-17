// Middleware для проверки аутентификации
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Требуется аутентификация' });
  }
}

// Middleware для проверки роли администратора (расширение для будущего)
function requireAdmin(req, res, next) {
  if (req.session.userId && req.session.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Требуются права администратора' });
  }
}

// Middleware для логирования запросов
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}

// Middleware для обработки ошибок
function errorHandler(err, req, res, next) {
  console.error('Ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

module.exports = {
  requireAuth,
  requireAdmin,
  requestLogger,
  errorHandler
};
