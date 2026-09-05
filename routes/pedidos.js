const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

router.post('/', async (req, res) => {
  const { nombre_cliente, telefono, items } = req.body;

  if (!nombre_cliente || !telefono || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Faltan datos del pedido (nombre, teléfono o productos).' });
  }

  const total = items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insertamos la cabecera del pedido
    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (nombre_cliente, telefono, total) VALUES (?, ?, ?)',
      [nombre_cliente, telefono, total]
    );
    const pedidoId = pedidoResult.insertId;

    for (const item of items) {
      const subtotal = item.precio_unitario * item.cantidad;
      await connection.query(
        'INSERT INTO pedido_items (pedido_id, producto_nombre, precio_unitario, cantidad, subtotal) VALUES (?, ?, ?, ?, ?)',
        [pedidoId, item.producto_nombre, item.precio_unitario, item.cantidad, subtotal]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Pedido creado con éxito.', pedidoId, total });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el pedido.' });
  } finally {
    connection.release();
  }
});

// GET /api/pedidos → listar todos los pedidos con sus productos (solo para el administrador)
router.get('/', async (req, res) => {
  const googleId = req.headers['x-admin-id'];

  if (googleId !== process.env.ADMIN_GOOGLE_ID) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  try {
    const [pedidos] = await pool.query('SELECT * FROM pedidos ORDER BY creado_en DESC');

    // A cada pedido le agregamos sus productos
    for (const pedido of pedidos) {
      const [items] = await pool.query(
        'SELECT producto_nombre, precio_unitario, cantidad, subtotal FROM pedido_items WHERE pedido_id = ?',
        [pedido.id]
      );
      pedido.items = items;
    }

    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los pedidos.' });
  }
});

// DELETE /api/pedidos → eliminar uno o varios pedidos (solo para el administrador)
router.delete('/', async (req, res) => {
  const googleId = req.headers['x-admin-id'];

  if (googleId !== process.env.ADMIN_GOOGLE_ID) {
    return res.status(403).json({ error: 'No autorizado.' });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No se especificaron pedidos para eliminar.' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM pedidos WHERE id IN (${placeholders})`, ids);
    res.json({ message: 'Pedidos eliminados correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar los pedidos.' });
  }
});

module.exports = router;

module.exports = router;
