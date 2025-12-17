# Drakony - Node.js + React приложение

Полнофункциональный сервер с Sequelize ORM, SQLite базой данных и React frontend.

## Структура проекта

```
drakony/
├── src/                          # Исходный код сервера
│   ├── models/                   # Sequelize модели
│   │   ├── index.js              # Конфигурация Sequelize
│   │   └── figurines.js          # Модель фигурок
│   └── routes/                   # Маршруты API
│       └── figurine.js           # API для фигурок
├── public/                       # React приложение (Vite)
│   ├── src/                      # Исходный код React
│   ├── index.html                # Главная страница
│   └── package.json              # Зависимости React
├── database.db                   # SQLite база данных
├── server.js                     # Главный файл сервера
└── package.json                  # Зависимости сервера
```

## API Endpoints

### Фигурки
- `GET /api/figurines` - Получить все фигурки
- `GET /api/figurines/:id` - Получить фигурку по ID
- `POST /api/figurines` - Создать новую фигурку
- `PUT /api/figurines/:id` - Обновить фигурку
- `DELETE /api/figurines/:id` - Удалить фигурку

## Запуск проекта

### Режим разработки (рекомендуется)
```bash
# Установка зависимостей сервера
npm install

# Установка зависимостей React
cd public && npm install && cd ..

# Запуск сервера (в первом терминале)
npm start

# Запуск React dev сервера (во втором терминале)
cd public && npm run dev
```

Сервер API: http://localhost:3000
React приложение: http://localhost:5173

### Production режим
```bash
# Установка зависимостей сервера
npm install

# Установка зависимостей React
cd public && npm install && cd ..

# Сборка React приложения
cd public && npm run build && cd ..

# Запуск сервера
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## Особенности

- **Строгая архитектура MVC**: Код разделен по папкам controllers, routes, middleware
- **SQLite база данных**: Встроенная база данных без необходимости установки сервера
- **Сессии**: Управление аутентификацией через express-session
- **Vite интеграция**: Hot reload для React в режиме разработки
- **Middleware**: Аутентификация, логирование, обработка ошибок
- **RESTful API**: Четкие маршруты и HTTP методы

## Разработка

- Изменения в React коде автоматически отражаются в браузере (hot reload)
- API endpoints доступны по пути `/api/*`
- Статические файлы обслуживаются через Vite middleware
- База данных автоматически инициализируется при запуске
