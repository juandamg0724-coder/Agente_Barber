const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/productos → listar todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
});

// POST /api/productos → crear un nuevo producto (solo para el administrador)
router.post('/', async (req, res) => {
  const googleId = req.headers['x-admin-id'];

  if (googleId !== process.env.ADMIN_GOOGLE_ID) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  const { nombre, descripcion, precio, imagen_url, imagen_url2 } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: 'El nombre y el precio son obligatorios.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, imagen_url, imagen_url2) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion || '', precio, imagen_url || '', imagen_url2 || null]
    );
    res.status(201).json({ message: 'Producto creado con éxito.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el producto.' });
  }
});

// DELETE /api/productos → eliminar uno o varios productos (solo para el administrador)
router.delete('/', async (req, res) => {
  const googleId = req.headers['x-admin-id'];

  if (googleId !== process.env.ADMIN_GOOGLE_ID) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No se especificaron productos para eliminar.' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM productos WHERE id IN (${placeholders})`, ids);
    res.json({ message: 'Productos eliminados correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar los productos.' });
  }
});

module.exports = router;