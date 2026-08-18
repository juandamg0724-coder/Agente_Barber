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

router.get('/', async (req, res) => {
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

module.exports = router;
