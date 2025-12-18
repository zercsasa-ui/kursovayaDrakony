const express = require('express');
const app = express();
const cors = require('cors');
const sequelize = require('./src/models');
const port = process.env.PORT || 3000;

console.log('Server starting...');

// Функция для создания драконов при запуске
const createDefaultDragons = () => {
    return new Promise((resolve, reject) => {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'database.db');
        const db = new sqlite3.Database(dbPath);

        // Всегда пересоздаем драконов (очищаем и создаем заново)
        db.run('DELETE FROM Drakoni', [], (err) => {
            if (err) {
                console.error('Ошибка при очистке таблицы драконов:', err);
                db.close();
                reject(err);
                return;
            }

            const dragons = [
                {
                    price: 120000.00,
                    name: "Дракон на борде",
                    description: "Описание первого дракона",
                    composition: "-Арт Борд;\n- Глина Ладолл;\n- Эпоксидная смола;\n- Краски;\n- Лак.",
                    imageUrl: "/images/DrakonNaBorde.jpg"
                },
                {
                    price: 85000.00,
                    name: "Огненный дракон",
                    description: "Описание второго дракона",
                    composition: "-Полимерная глина;\n- Огнеупорные краски;\n- Металлические вставки;\n- Лак.",
                    imageUrl: "/images/DrakonNaBorde.jpg"
                }
            ];

            let inserted = 0;
            dragons.forEach((dragon) => {
                db.run(
                    'INSERT INTO Drakoni (price, name, description, composition, imageUrl) VALUES (?, ?, ?, ?, ?)',
                    [dragon.price, dragon.name, dragon.description, dragon.composition, dragon.imageUrl],
                    function(err) {
                        if (err) {
                            console.error('Ошибка при создании дракона:', err);
                        } else {
                            console.log(`Дракон "${dragon.name}" создан`);
                        }
                        inserted++;
                        if (inserted === dragons.length) {
                            db.close();
                            resolve();
                        }
                    }
                );
            });
        });
    });
};

// Функция для создания администратора при запуске
const createDefaultAdmin = () => {
    return new Promise((resolve, reject) => {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'database.db');
        const db = new sqlite3.Database(dbPath);

        // Проверяем, существует ли админ
        db.get('SELECT * FROM users WHERE username = ?', ['Анд'], (err, row) => {
            if (err) {
                console.error('Ошибка при проверке админа:', err);
                db.close();
                reject(err);
                return;
            }

            if (!row) {
                // Создаем админа
                db.run(
                    'INSERT INTO users (username, email, password, avatar, role) VALUES (?, ?, ?, ?, ?)',
                    ['Анд', 'admin@drakony.ru', 'admin123', '/images/PrivetAva.jpg', 'Админ'],
                    function(err) {
                        if (err) {
                            console.error('Ошибка при создании админа:', err);
                            reject(err);
                        } else {
                            console.log('Администратор "Анд" создан');
                            resolve();
                        }
                        db.close();
                    }
                );
            } else {
                console.log('Администратор "Анд" уже существует');
                // Обновляем аватарку если она не установлена
                if (!row.avatar) {
                    db.run(
                        'UPDATE users SET avatar = ? WHERE username = ?',
                        ['/images/PrivetAva.jpg', 'Анд'],
                        function(err) {
                            if (err) {
                                console.error('Ошибка при обновлении аватарки админа:', err);
                            } else {
                                console.log('Аватарка администратора "Анд" обновлена');
                            }
                            db.close();
                            resolve();
                        }
                    );
                } else {
                    db.close();
                    resolve();
                }
            }
        });
    });
};

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(require('./src/config/session')); // Инициализация сессий
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API маршруты
console.log('Registering routes...');
console.log('Figurine routes registered');
app.use('/api/navigate', require('./src/routes/navigationRoutes'));
console.log('Navigation routes registered');
app.use('/api/auth', require('./src/routes/authRoutes'));
console.log('Auth routes registered');
app.use('/api/users', require('./src/routes/userRoutes'));
console.log('User routes registered');

// Маршрут для получения всех драконов
app.get('/api/figurines', (req, res) => {
    console.log('Direct /api/figurines route called');
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, 'database.db');

    const db = new sqlite3.Database(dbPath);
    db.all('SELECT * FROM Drakoni ORDER BY id ASC', [], (err, rows) => {
        db.close();
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.listen(port, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false });
        console.log('База данных подключена успешно');

        // Создаем админа и драконов при запуске
        await createDefaultAdmin();
        await createDefaultDragons();
    } catch (e) {
        console.log('Ошибка подключения к базе данных:', e);
    }
    console.log(`Сервер запущен на http://localhost:${port}`)
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});
