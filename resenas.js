const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// POST /api/resenas → crear una nueva reseña (público, cualquiera puede dejar una)
router.post('/', async (req, res) => {
  const { nombre, comentario, estrellas } = req.body;

  if (!nombre || !comentario || !estrellas) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const estrellasNum = parseInt(estrellas);
  if (estrellasNum < 1 || estrellasNum > 5) {
    return res.status(400).json({ error: 'Las estrellas deben ser entre 1 y 5.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO resenas (nombre, comentario, estrellas) VALUES (?, ?, ?)',
      [nombre, comentario, estrellasNum]
    );
    res.status(201).json({ message: 'Reseña publicada con éxito.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la reseña.' });
  }
});

// GET /api/resenas → listar todas las reseñas (público, para mostrarlas en el sitio)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM resenas ORDER BY creado_en DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las reseñas.' });
  }
});

// DELETE /api/resenas → eliminar una o varias reseñas (solo para el administrador)
router.delete('/', async (req, res) => {
  const googleId = req.headers['x-admin-id'];

  if (googleId !== process.env.ADMIN_GOOGLE_ID) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No se especificaron reseñas para eliminar.' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM resenas WHERE id IN (${placeholders})`, ids);
    res.json({ message: 'Reseñas eliminadas correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar las reseñas.' });
  }
});

module.exports = router;