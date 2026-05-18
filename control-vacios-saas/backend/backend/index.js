const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const iniciarBaseDeDatos = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "super_secreto_polar_2026"; 

app.use(cors());
app.use(express.json());

let db;
iniciarBaseDeDatos().then((pool) => {
    db = pool;
    app.listen(PORT, () => { console.log(`🚀 ERP Backend PostgreSQL corriendo en http://localhost:${PORT}`); });
}).catch(error => console.error(error));

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) return res.status(401).json({ error: "Acceso denegado." });
    jwt.verify(token, SECRET_KEY, (err, usuarioDecodificado) => {
        if (err) return res.status(403).json({ error: "Sesión vencida." });
        req.usuario = usuarioDecodificado;
        next();
    });
};

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        const usuario = result.rows[0];
        if (!usuario) return res.status(401).json({ error: "Usuario incorrecto" });
        const claveValida = await bcrypt.compare(password, usuario.password);
        if (!claveValida) return res.status(401).json({ error: "Contraseña incorrecta" });
        const token = jwt.sign({ id: usuario.id, username: usuario.username, rol: usuario.rol }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ mensaje: "Éxito", token, rol: usuario.rol });
    } catch (error) { res.status(500).json({ error: "Error en el servidor" }); }
});

app.post('/api/usuarios', verificarToken, async (req, res) => {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ error: "Solo administradores." });
    const { username, password } = req.body;
    try {
        const usuarioExiste = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (usuarioExiste.rowCount > 0) return res.status(400).json({ error: "El usuario ya existe" });
        const passwordEncriptada = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO usuarios (username, password, rol) VALUES ($1, $2, $3)', [username, passwordEncriptada, 'chofer']);
        res.status(201).json({ mensaje: "Chofer creado exitosamente" });
    } catch (error) { res.status(500).json({ error: "Error interno" }); }
});

app.post('/api/clientes', verificarToken, async (req, res) => {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ error: "Solo gerencia." });
    const { nombre } = req.body;
    try {
        await db.query('INSERT INTO clientes (nombre, saldo_usd) VALUES ($1, $2)', [nombre, 0.00]);
        res.status(201).json({ mensaje: "Cliente registrado" });
    } catch (error) { res.status(500).json({ error: "Error al guardar cliente" }); }
});

app.get('/api/clientes', verificarToken, async (req, res) => {
    try { const clientes = await db.query('SELECT * FROM clientes ORDER BY nombre ASC'); res.json(clientes.rows); } 
    catch (error) { res.status(500).json({ error: "Error al listar clientes" }); }
});

app.get('/api/productos', verificarToken, async (req, res) => {
    try { const productos = await db.query('SELECT * FROM productos'); res.json(productos.rows); } 
    catch (error) { res.status(500).json({ error: "Error al listar productos" }); }
});

app.post('/api/transacciones', verificarToken, async (req, res) => {
    const { cliente_id, producto_id, cajas_despachadas, vacios_recibidos, monto_pagado_usd, tasa_bcv } = req.body;
    const nombreChofer = req.usuario.username;

    try {
        const clienteRes = await db.query('SELECT saldo_usd FROM clientes WHERE id = $1', [cliente_id]);
        const productoRes = await db.query('SELECT precio_usd FROM productos WHERE id = $1', [producto_id]);
        if (clienteRes.rowCount === 0 || productoRes.rowCount === 0) return res.status(404).json({ error: "Cliente o Producto no encontrado" });

        const cliente = clienteRes.rows[0];
        const producto = productoRes.rows[0];

        const cajasNum = parseInt(cajas_despachadas) || 0;
        const vaciosNum = parseInt(vacios_recibidos) || 0;
        const pagadoNum = parseFloat(monto_pagado_usd) || 0.00;
        const tasaNum = parseFloat(tasa_bcv) || 1.00;

        const montoGeneradoUsd = cajasNum * producto.precio_usd;
        const netoTransaccion = montoGeneradoUsd - pagadoNum; 
        const nuevoSaldoUsd = cliente.saldo_usd + netoTransaccion;

        await db.query(`
            INSERT INTO transacciones (cliente_id, chofer, producto_id, cajas_despachadas, vacios_recibidos, monto_generado_usd, monto_pagado_usd, tasa_bcv) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
            [cliente_id, nombreChofer, producto_id, cajasNum, vaciosNum, montoGeneradoUsd, pagadoNum, tasaNum]
        );
        await db.query('UPDATE clientes SET saldo_usd = $1 WHERE id = $2', [nuevoSaldoUsd, cliente_id]);
        res.json({ mensaje: "Registro completado con éxito" });
    } catch (error) { res.status(500).json({ error: "Error al procesar" }); }
});

app.get('/api/transacciones', verificarToken, async (req, res) => {
    try {
        const historial = await db.query(`
            SELECT t.id, c.nombre AS cliente, t.cliente_id, t.chofer, p.nombre AS producto, t.producto_id,
                   t.cajas_despachadas, t.vacios_recibidos, t.monto_generado_usd, t.monto_pagado_usd, t.tasa_bcv, t.fecha 
            FROM transacciones t 
            JOIN clientes c ON t.cliente_id = c.id 
            LEFT JOIN productos p ON t.producto_id = p.id
            ORDER BY t.fecha DESC LIMIT 500
        `);
        res.json(historial.rows);
    } catch (error) { res.status(500).json({ error: "Error de historial" }); }
});

app.delete('/api/transacciones/:id', verificarToken, async (req, res) => {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ error: "Requiere rol de Administrador." });
    const { id } = req.params;
    try {
        const transRes = await db.query('SELECT * FROM transacciones WHERE id = $1', [id]);
        if (transRes.rowCount === 0) return res.status(404).json({ error: "La transacción no existe." });
        const transaccion = transRes.rows[0];

        const prodRes = await db.query('SELECT precio_usd FROM productos WHERE id = $1', [transaccion.producto_id]);
        const clieRes = await db.query('SELECT saldo_usd FROM clientes WHERE id = $1', [transaccion.cliente_id]);
        const producto = prodRes.rows[0];
        const cliente = clieRes.rows[0];

        const montoGenerado = transaccion.cajas_despachadas * producto.precio_usd;
        const netoQueSeAplico = montoGenerado - transaccion.monto_pagado_usd;
        const saldoRevertido = cliente.saldo_usd - netoQueSeAplico;

        await db.query('UPDATE clientes SET saldo_usd = $1 WHERE id = $2', [saldoRevertido, transaccion.cliente_id]);
        await db.query('DELETE FROM transacciones WHERE id = $1', [id]);
        res.json({ mensaje: "Registro eliminado y contabilidad revertida." });
    } catch (error) { res.status(500).json({ error: "Error al eliminar." }); }
});

app.put('/api/transacciones/:id', verificarToken, async (req, res) => {
    if (req.usuario.rol !== 'admin') return res.status(403).json({ error: "Solo administradores." });
    const { id } = req.params;
    const { cajas_despachadas, vacios_recibidos, monto_pagado_usd } = req.body;
    try {
        const transRes = await db.query('SELECT * FROM transacciones WHERE id = $1', [id]);
        if (transRes.rowCount === 0) return res.status(404).json({ error: "Registro no encontrado." });
        const transaccionVieja = transRes.rows[0];

        const prodRes = await db.query('SELECT precio_usd FROM productos WHERE id = $1', [transaccionVieja.producto_id]);
        const clieRes = await db.query('SELECT saldo_usd FROM clientes WHERE id = $1', [transaccionVieja.cliente_id]);
        const producto = prodRes.rows[0];
        const cliente = clieRes.rows[0];

        const cajasNuevas = parseInt(cajas_despachadas) || 0;
        const vaciosNuevos = parseInt(vacios_recibidos) || 0;
        const pagadoNuevo = parseFloat(monto_pagado_usd) || 0.00;

        const viejoGenerado = transaccionVieja.cajas_despachadas * producto.precio_usd;
        const viejoNeto = viejoGenerado - transaccionVieja.monto_pagado_usd;
        const saldoLimpio = cliente.saldo_usd - viejoNeto;

        const nuevoGenerado = cajasNuevas * producto.precio_usd;
        const nuevoNeto = nuevoGenerado - pagadoNuevo;
        const saldoFinalCliente = saldoLimpio + nuevoNeto;

        await db.query(`UPDATE transacciones SET cajas_despachadas = $1, vacios_recibidos = $2, monto_generado_usd = $3, monto_pagado_usd = $4 WHERE id = $5`,
            [cajasNuevas, vaciosNuevos, nuevoGenerado, pagadoNuevo, id]);
        await db.query('UPDATE clientes SET saldo_usd = $1 WHERE id = $2', [saldoFinalCliente, transaccionVieja.cliente_id]);
        res.json({ mensaje: "Registro modificado con éxito." });
    } catch (error) { res.status(500).json({ error: "Error al modificar." }); }
});