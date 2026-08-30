const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// POST /api/usuarios → crear o actualizar un usuario que inició sesión con Google
router.post('/', async (req, res) => {
  const { google_id, nombre, email } = req.body;

  if (!google_id || !nombre || !email) {
    return res.status(400).json({ error: 'Faltan datos del usuario.' });
  }

  try {
    // Si el usuario ya existe (mismo google_id), actualizamos sus datos.
    // Si no existe, lo creamos.
    const [existente] = await pool.query(
      'SELECT id FROM usuarios WHERE google_id = ?',
      [google_id]
    );

    if (existente.length > 0) {
      await pool.query(
        'UPDATE usuarios SET nombre = ?, email = ? WHERE google_id = ?',
        [nombre, email, google_id]
      );
      res.json({ message: 'Usuario actualizado.', id: existente[0].id });
    } else {
      const [result] = await pool.query(
        'INSERT INTO usuarios (google_id, nombre, email) VALUES (?, ?, ?)',
        [google_id, nombre, email]
      );
      res.status(201).json({ message: 'Usuario creado.', id: result.insertId });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el usuario.' });
  }
});

module.exports = router;