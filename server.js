const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservasRoutes = require('./routes/reservas');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');

const app = express();

app.use(cors());              // Permite que tu index.html (front-end) le hable a este servidor
app.use(express.json());      // Permite leer JSON en el body de las peticiones

// Rutas de la API
app.use('/api/reservas', reservasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de AgenteBarber funcionando correctamente 💈');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
