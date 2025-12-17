console.log('Loading figurine routes...');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
console.log('Figurine routes dependencies loaded');

// Получить все драконы
router.get('/', (req, res) => {
  console.log('Route /api/figurines called at', new Date().toISOString());
  const dbPath = path.resolve(__dirname, '../../database.db');
  console.log('Database path:', dbPath);

  try {
    const db = new sqlite3.Database(dbPath);

    db.all('SELECT * FROM Drakoni ORDER BY id ASC', [], (err, rows) => {
      db.close();

      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query error', message: err.message });
      }

      console.log('Query successful, returning', rows.length, 'rows');
      res.json(rows);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection error', message: error.message });
  }
});

// Получить дракона по ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const dbPath = path.join(__dirname, '../../database.db');
  const db = new sqlite3.Database(dbPath);
  db.get('SELECT * FROM Drakoni WHERE id = ?', [id], (err, row) => {
    db.close();
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Drakon not found' });
    }
    res.json(row);
  });
});

// Создать нового дракона
router.post('/', async (req, res) => {
  try {
    const { price, name, description, composition, imageUrl } = req.body;

    const drakon = await Drakoni.create({
      price,
      name,
      description,
      composition,
      imageUrl,
    });

    res.status(201).json(drakon);
  } catch (error) {
    console.error('Error creating drakon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить дракона
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, name, description, composition, imageUrl } = req.body;

    const drakon = await Drakoni.findByPk(id);

    if (!drakon) {
      return res.status(404).json({ error: 'Drakon not found' });
    }

    await drakon.update({
      price,
      name,
      description,
      composition,
      imageUrl,
    });

    res.json(drakon);
  } catch (error) {
    console.error('Error updating drakon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить дракона
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const drakon = await Drakoni.findByPk(id);

    if (!drakon) {
      return res.status(404).json({ error: 'Drakon not found' });
    }

    await drakon.destroy();
    res.json({ message: 'Drakon deleted successfully' });
  } catch (error) {
    console.error('Error deleting drakon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
