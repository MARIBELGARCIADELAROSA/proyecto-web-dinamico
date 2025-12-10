const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Usamos el driver de MySQL

const app = express();
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A LA BASE DE DATOS (MySQL / TiDB) ---
// La URL completa con usuario, contraseña y configuración SSL viene de Render
const pool = mysql.createPool(process.env.DATABASE_URL);

// --- RUTAS CRUD ---

// 2. READ (Leer todos los productos activos)
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE activo = true ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. CREATE (Añadir un nuevo producto)
app.post('/api/productos', async (req, res) => {
  try {
    const { 
      nombre_producto, descripcion, precio_venta, precio_costo, 
      stock, sku, categoria 
    } = req.body;

    // Insertamos usando ? como marcadores
    const [result] = await pool.query(
      `INSERT INTO productos (
        nombre_producto, descripcion, precio_venta, precio_costo, stock, sku, categoria
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre_producto, descripcion, precio_venta, precio_costo, stock, sku, categoria]
    );

    // En MySQL buscamos el ID recién creado para devolver el objeto completo
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE (Editar un producto existente)
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
      [nombre_producto, descripcion, precio_venta, precio_costo, stock, sku, categoria, id]
    );

    // Devolvemos el producto actualizado
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE (Borrado lógico)
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE productos SET activo = false WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});