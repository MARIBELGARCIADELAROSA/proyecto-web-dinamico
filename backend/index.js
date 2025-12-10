const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Usamos pg para Postgres

const app = express();
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A LA BASE DE DATOS (Postgres) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Render
  }
});

// --- RUTAS CRUD (Versión Postgres) ---

// 2. READ
app.get('/api/productos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos WHERE activo = true ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. CREATE
app.post('/api/productos', async (req, res) => {
  try {
    const { 
      nombre_producto, descripcion, precio_venta, precio_costo, 
      stock, sku, categoria 
    } = req.body;

    // En Postgres usamos $1, $2, etc. y RETURNING *
    const newProd = await pool.query(
      `INSERT INTO productos (
        nombre_producto, descripcion, precio_venta, precio_costo, stock, sku, categoria
       ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre_producto, descripcion, precio_venta, precio_costo, stock, sku, categoria]
    );
    res.status(201).json(newProd.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre_producto, descripcion, precio_venta, precio_costo, 
      stock, sku, categoria 
    } = req.body;

    const updatedProd = await pool.query(
      `UPDATE productos SET 
        nombre_producto = $1, descripcion = $2, precio_venta = $3, 
        precio_costo = $4, stock = $5, sku = $6, categoria = $7
       WHERE id = $8 RETURNING *`,
      [nombre_producto, descripcion, precio_venta, precio_costo, stock, sku, categoria, id]
    );
    res.json(updatedProd.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});