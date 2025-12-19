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
        db.run('DELETE FROM Products WHERE type = "dragon"', [], (err) => {
            if (err) {
                console.error('Ошибка при очистке таблицы драконов:', err);
                db.close();
                reject(err);
                return;
            }

            const dragons = [
                {
                    type: 'dragon',
                    price: 120000.00,
                    name: "Дракон на борде",
                    description: "Описание первого дракона",
                    composition: "-Арт Борд;\n- Глина Ладолл;\n- Эпоксидная смола;\n- Краски;\n- Лак.",
                    imageUrl: "/images/DrakonNaBorde.jpg",
                    color: "Цветной"
                },
                {
                    type: 'dragon',
                    price: 85000.00,
                    name: "Огненный дракон",
                    description: "Описание второго дракона",
                    composition: "-Полимерная глина;\n- Огнеупорные краски;\n- Металлические вставки;\n- Лак.",
                    imageUrl: "/images/DrakonNaBorde.jpg",
                    color: "Красный"
                }
            ];

            let inserted = 0;
            dragons.forEach((dragon) => {
                db.run(
                    'INSERT INTO Products (type, price, name, description, composition, imageUrl, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [dragon.type, dragon.price, dragon.name, dragon.description, dragon.composition, dragon.imageUrl, dragon.color],
                    function (err) {
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

// Функция для создания кукол при запуске
const createDefaultDolls = () => {
    return new Promise((resolve, reject) => {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'database.db');
        const db = new sqlite3.Database(dbPath);

        // Всегда пересоздаем кукол (очищаем и создаем заново)
        db.run('DELETE FROM Products WHERE type = "doll"', [], (err) => {
            if (err) {
                console.error('Ошибка при очистке таблицы кукол:', err);
                db.close();
                reject(err);
                return;
            }

            const dolls = [
                {
                    type: 'doll',
                    price: 75000.00,
                    name: "Магическая кукла",
                    description: "Красивая магическая кукла с волшебными свойствами",
                    composition: "-Полимерная глина;\n- Волшебные нити;\n- Магические кристаллы;\n- Лак.",
                    imageUrl: "/images/woman.png",
                    color: "Цветной"
                }
            ];

            let inserted = 0;
            dolls.forEach((doll) => {
                db.run(
                    'INSERT INTO Products (type, price, name, description, composition, imageUrl, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [doll.type, doll.price, doll.name, doll.description, doll.composition, doll.imageUrl, doll.color],
                    function (err) {
                        if (err) {
                            console.error('Ошибка при создании куклы:', err);
                        } else {
                            console.log(`Кукла "${doll.name}" создана`);
                        }
                        inserted++;
                        if (inserted === dolls.length) {
                            db.close();
                            resolve();
                        }
                    }
                );
            });
        });
    });
};

// Функция для создания пропов при запуске
const createDefaultProps = () => {
    return new Promise((resolve, reject) => {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'database.db');
        const db = new sqlite3.Database(dbPath);

        // Всегда пересоздаем пропы (очищаем и создаем заново)
        db.run('DELETE FROM Products WHERE type = "props"', [], (err) => {
            if (err) {
                console.error('Ошибка при очистке таблицы пропов:', err);
                db.close();
                reject(err);
                return;
            }

            const props = [
                {
                    type: 'props',
                    price: 5000.00,
                    name: "Крыло дракона",
                    description: "Деталь для сборки дракона - крыло",
                    composition: "-Полимерная глина;\n- Армирующие нити;\n- Краска.",
                    imageUrl: "/images/DrakonNaBorde.jpg",
                    color: "Цветной"
                }
            ];

            let inserted = 0;
            props.forEach((prop) => {
                db.run(
                    'INSERT INTO Products (type, price, name, description, composition, imageUrl, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [prop.type, prop.price, prop.name, prop.description, prop.composition, prop.imageUrl, prop.color],
                    function (err) {
                        if (err) {
                            console.error('Ошибка при создании пропа:', err);
                        } else {
                            console.log(`Проп "${prop.name}" создан`);
                        }
                        inserted++;
                        if (inserted === props.length) {
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
                    ['Анд', 'admin@drakony.ru', '123', '/images/PrivetAva.jpg', 'Админ'],
                    function (err) {
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
                resolve();
            }
        });
    });
};

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(require('./src/config/session')); // Инициализация сессий
app.use(express.static('public')); // Обслуживание статических файлов
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API маршруты
console.log('Registering routes...');
app.use('/api/products', require('./src/routes/products'));
console.log('Products routes registered');
app.use('/api/figurines', require('./src/routes/figurine'));
console.log('Figurine routes registered');
app.use('/api/kykly', require('./src/routes/kykly'));
console.log('Kykly routes registered');
app.use('/api/props', require('./src/routes/props'));
console.log('Props routes registered');
app.use('/api/navigate', require('./src/routes/navigationRoutes'));
console.log('Navigation routes registered');
app.use('/api/auth', require('./src/routes/authRoutes'));
console.log('Auth routes registered');
app.use('/api/users', require('./src/routes/userRoutes'));
console.log('User routes registered');

// Временный роут для проверки пользователей
app.get('/debug/users', (req, res) => {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, 'database.db');
    const db = new sqlite3.Database(dbPath);

    db.all('SELECT id, username, email, role, avatar FROM users', [], (err, rows) => {
        db.close();
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ users: rows });
        }
    });
});



app.listen(port, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
        console.log('База данных подключена успешно');

        // Создаем админа, драконов, кукол и пропы при запуске
        await createDefaultAdmin();
        await createDefaultDragons();
        await createDefaultDolls();
        await createDefaultProps();
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
