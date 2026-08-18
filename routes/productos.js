const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/productos → listar todos los productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

module.exports = router;
