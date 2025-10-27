// --- 1. CONFIGURACIÓN INICIAL ---
// Esta URL la obtendrás de Railway en la Fase 5
const API_URL = 'https://proyecto-web-dinamico.onrender.com';

// Referencias a elementos del DOM
const form = document.getElementById('producto-form');
const listaProductos = document.getElementById('productos-lista');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');

// Inputs del formulario
const productoId = document.getElementById('producto-id');
const nombreInput = document.getElementById('nombre_producto');
const descripcionInput = document.getElementById('descripcion');
const precioVentaInput = document.getElementById('precio_venta');
const precioCostoInput = document.getElementById('precio_costo');
const stockInput = document.getElementById('stock');
const skuInput = document.getElementById('sku');
const categoriaInput = document.getElementById('categoria');


// --- 2. FUNCIÓN READ (Leer y mostrar productos) ---
async function cargarProductos() {
  try {
    const response = await fetch(`${API_URL}/api/productos`);
    if (!response.ok) throw new Error('Error al cargar productos');
    const productos = await response.json();

    listaProductos.innerHTML = ''; // Limpiar lista
    productos.forEach(p => {
      const item = document.createElement('div');
      item.className = 'producto-item';
      item.innerHTML = `
        <div class="producto-info">
          <strong>${p.nombre_producto}</strong>
          <span>SKU: ${p.sku || 'N/A'} | Categoría: ${p.categoria || 'N/A'}</span>
        </div>
        <div class="producto-stats">
          <span>Precio: $${p.precio_venta}</span>
          <strong>Stock: ${p.stock}</strong>
        </div>
        <div class="producto-acciones">
          <button class="btn-editar" onclick="prepararEdicion(${p.id})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarProducto(${p.id})">Eliminar</button>
        </div>
      `;
      listaProductos.appendChild(item);
    });
  } catch (error) {
    console.error('Error en cargarProductos:', error);
    listaProductos.innerHTML = '<p>Error al cargar productos.</p>';
  }
}

// --- 3. FUNCIONES CREATE y UPDATE (Crear y Actualizar) ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = productoId.value; // Obtiene el ID (si existe)

  // Objeto con todos los datos del formulario
  const data = {
    nombre_producto: nombreInput.value,
    descripcion: descripcionInput.value,
    precio_venta: parseFloat(precioVentaInput.value),
    precio_costo: parseFloat(precioCostoInput.value) || 0,
    stock: parseInt(stockInput.value),
    sku: skuInput.value,
    categoria: categoriaInput.value
  };

  const url = id ? `${API_URL}/api/productos/${id}` : `${API_URL}/api/productos`;
  const method = id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Error al guardar el producto');
    
    limpiarFormulario();
    await cargarProductos(); // Recargar la lista

  } catch (error) {
    console.error('Error al guardar:', error);
    alert('Error al guardar el producto');
  }
});

// --- 4. FUNCIÓN DELETE (Eliminar/Desactivar) ---
async function eliminarProducto(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
  
  try {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar');
    await cargarProductos(); // Recargar la lista
  } catch (error) {
    console.error('Error al eliminar:', error);
    alert('Error al eliminar el producto');
  }
}

// --- 5. FUNCIONES AUXILIARES (Editar y Limpiar) ---

// Prepara el formulario para editar un producto
async function prepararEdicion(id) {
  // Primero, buscamos el producto en la lista (o lo volvemos a pedir a la API)
  // Por simplicidad, lo pediremos de nuevo (aunque lo ideal sería buscar en los datos ya cargados)
  const response = await fetch(`${API_URL}/api/productos`);
  const productos = await response.json();
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    alert('Producto no encontrado');
    return;
  }

  // Llenar el formulario
  productoId.value = producto.id;
  nombreInput.value = producto.nombre_producto;
  descripcionInput.value = producto.descripcion;
  precioVentaInput.value = producto.precio_venta;
  precioCostoInput.value = producto.precio_costo;
  stockInput.value = producto.stock;
  skuInput.value = producto.sku;
  categoriaInput.value = producto.categoria;

  // Cambiar botones
  btnGuardar.textContent = 'Actualizar Producto';
  btnCancelar.style.display = 'block'; // Mostrar botón de cancelar
  
  // Mover la vista al formulario
  window.scrollTo(0, 0); 
}

// Limpia el formulario y resetea los botones
function limpiarFormulario() {
  form.reset();
  productoId.value = ''; // Limpiar el ID oculto
  btnGuardar.textContent = 'Guardar Producto';
  btnCancelar.style.display = 'none';
}

// Evento para el botón de cancelar
btnCancelar.addEventListener('click', limpiarFormulario);

// --- 6. CARGA INICIAL ---
// Carga todos los productos cuando la página se abre
document.addEventListener('DOMContentLoaded', cargarProductos);