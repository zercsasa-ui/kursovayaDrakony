const express = require('express');
const app = express();
const cors = require('cors');
const sequelize = require('./src/models');
const port = process.env.PORT || 3000;

console.log('Server starting...');

// Глобальный обработчик необработанных ошибок
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Функция для создания драконов при запуске
const createDefaultDragons = async () => {
    try {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'database.db');
        const db = new sqlite3.Database(dbPath);

        // Проверяем, есть ли уже драконы
        db.get('SELECT COUNT(*) as count FROM Drakoni', [], (err, row) => {
            if (err) {
                console.error('Ошибка при проверке драконов:', err);
                db.close();
                return;
            }

            if (row.count === 0) {
                // Создаем двух драконов
                const dragons = [
                    {
                        price: 120000.00,
                        name: 'Дракон на борде',
                        description: 'Это не просто фигурка, а целая история, воплощённая в мастерстве. Этот сказочный дракоша прилег на позолоченное основание, словно на роскошное ложе. Его хвост закручен в изящные, причудливые петельки, а могучие крылья аккуратно сложены за спиной, напоминая драгоценный, переливающийся плащ',
                        composition: '-Арт Борд;\n- Глина Ладолл;\n- Эпоксидная смола;\n- Краски;\n- Лак.',
                        imageUrl: '/images/DrakonNaBorde.jpg'
                    },
                    {
                        price: 85000.00,
                        name: 'Огненный дракон',
                        description: 'Могучий огненный дракон с пылающими крыльями и острыми когтями. Его дыхание способно расплавить камень, а взгляд - парализовать врага.',
                        composition: '-Полимерная глина;\n- Огнеупорные краски;\n- Металлические вставки;\n- Лак.',
                        imageUrl: '/images/DrakonNaBorde.jpg'
                    }
                ];

                let inserted = 0;
                dragons.forEach(dragon => {
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
                            }
                        }
                    );
                });
            } else {
                console.log(`Уже есть ${row.count} драконов в базе данных`);
                db.close();
            }
        });
    } catch (error) {
        console.error('Ошибка при создании драконов:', error);
    }
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API маршруты
console.log('Registering routes...');
console.log('Figurine routes registered');
app.use('/api/navigate', require('./src/routes/navigationRoutes'));
console.log('Navigation routes registered');

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

        // Создаем драконов при запуске
        await createDefaultDragons();
    } catch (e) {
        console.log('Ошибка подключения к базе данных:', e);
    }
    console.log(`Сервер запущен на http://localhost:${port}`)
});

// Тестовый маршрут для проверки API
app.get('/api/test', (req, res) => {
    console.log('API test route accessed');
    res.json({ message: 'API работает!', timestamp: new Date().toISOString() });
});

// В режиме разработки React запускается отдельно через Vite
// В production режиме можно раскомментировать обслуживание статических файлов
// app.use(express.static(path.join(__dirname, 'public')));
// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index.html'));
// });

app.get('/express_backend', (req, res) => {
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});
