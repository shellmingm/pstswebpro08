const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./students.db', (err) => {
  if (err) {
    console.error('Gagal koneksi database:', err.message);
  } else {
    console.log('Database terhubung.');
  }
});

// Buat tabel students dengan field lengkap
db.run(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  date_of_birth TEXT,
  place_of_birth TEXT,
  address TEXT,
  class TEXT
)`);

// API: Get all students
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API: Add new student
app.post('/api/students', (req, res) => {
  const { name, gender, date_of_birth, place_of_birth, address, class: kelas } = req.body;
  if (!name || !gender) {
    res.status(400).json({ error: 'Nama dan gender wajib diisi' });
    return;
  }
  const sql = `INSERT INTO students (name, gender, date_of_birth, place_of_birth, address, class) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, gender, date_of_birth || null, place_of_birth || null, address || null, kelas || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, gender, date_of_birth, place_of_birth, address, class: kelas });
  });
});

// API: Update student
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { name, gender, date_of_birth, place_of_birth, address, class: kelas } = req.body;
  if (!name || !gender) {
    res.status(400).json({ error: 'Nama dan gender wajib diisi' });
    return;
  }
  const sql = `UPDATE students SET name = ?, gender = ?, date_of_birth = ?, place_of_birth = ?, address = ?, class = ? WHERE id = ?`;
  db.run(sql, [name, gender, date_of_birth || null, place_of_birth || null, address || null, kelas || null, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Data siswa tidak ditemukan' });
      return;
    }
    res.json({ id: Number(id), name, gender, date_of_birth, place_of_birth, address, class: kelas });
  });
});

// API: Delete student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM students WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Data siswa tidak ditemukan' });
      return;
    }
    res.json({ message: 'Data siswa berhasil dihapus' });
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
