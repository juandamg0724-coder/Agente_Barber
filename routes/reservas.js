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

// GET /api/reservas → listar todas las reservas (útil para un panel de administración)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservas ORDER BY creado_en DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las reservas.' });
  }
});

module.exports = router;