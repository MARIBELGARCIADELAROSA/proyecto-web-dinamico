const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A LA BASE DE DATOS (MySQL) ---
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Permite conexiones seguras en la nube
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- RUTAS CRUD (Versión MySQL) ---

// 2. READ
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE activo = true ORDER BY id DESC');
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

    // En MySQL usamos ? para evitar inyección SQL
    const [result] = await pool.query(
      `INSERT INTO productos (
        nombre_producto, descripcion, precio_venta, precio_costo, stock, sku, categoria
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre_producto, descripcion, precio_venta, precio_costo || 0, stock, sku, categoria]
    );
    
    // MySQL no tiene RETURNING *, así que hacemos un SELECT del ID insertado
    const [newProd] = await pool.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);
    res.status(201).json(newProd[0]);
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

    await pool.query(
      `UPDATE productos SET 
        nombre_producto = ?, descripcion = ?, precio_venta = ?, 
        precio_costo = ?, stock = ?, sku = ?, categoria = ?
       WHERE id = ?`,
      [nombre_producto, descripcion, precio_venta, precio_costo || 0, stock, sku, categoria, id]
    );

    // Devolvemos el producto actualizado
    const [updatedProd] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    res.json(updatedProd[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE productos SET activo = false WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor MySQL corriendo en el puerto ${PORT}`);
});