
CREATE DATABASE IF NOT EXISTS agentebarber;
USE agentebarber;

CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  fecha DATE NOT NULL,
  servicio VARCHAR(150) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos (catálogo)
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(255),
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(500),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES
('Cera Mate', 'Fijación fuerte, acabado sin brillo.', 25000, 'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=600&auto=format&fit=crop'),
('Aceite para Barba', 'Hidrata y suaviza, aroma amaderado.', 32000, 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?q=80&w=600&auto=format&fit=crop'),
('Shampoo Multiusos', 'Limpieza profunda sin resecar.', 28000, 'https://images.unsplash.com/photo-1610030181087-540e0f26e8dd?q=80&w=600&auto=format&fit=crop'),
('Kit Completo', 'Peine, tijeras y navaja de viaje.', 85000, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop');
