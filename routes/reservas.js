const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// POST /api/reservas → crear una nueva reserva
router.post('/', async (req, res) => {
  const { nombre, telefono, fecha, servicio, barbero } = req.body;

  // Validación básica
  if (!nombre || !telefono || !fecha || !servicio) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO reservas (nombre, telefono, fecha, servicio, barbero) VALUES (?, ?, ?, ?, ?)',
      [nombre, telefono, fecha, servicio, barbero || 'Sin preferencia']
    );
    res.status(201).json({ message: 'Reserva creada con éxito.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la reserva.' });
  }
});

// GET /api/reservas → listar todas las reservas (solo para el administrador)
router.get('/', async (req, res) => {
  const googleId = req.headers['x-admin-id'];

  if (googleId !== process.env.ADMIN_GOOGLE_ID) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM reservas ORDER BY creado_en DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las reservas.' });
  }
});

// DELETE /api/reservas → eliminar una o varias reservas (solo para el administrador)
router.delete('/', async (req, res) => {
  const googleId = req.headers['x-admin-id'];

  if (googleId !== process.env.ADMIN_GOOGLE_ID) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No se especificaron reservas para eliminar.' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM reservas WHERE id IN (${placeholders})`, ids);
    res.json({ message: 'Reservas eliminadas correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar las reservas.' });
  }
});

module.exports = router;

module.exports = router;