const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// 🔌 Aquí es donde ocurre la conexión mágica con internet.
// Si no hay un enlace en la nube, intentará leer una variable local por seguridad.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_brW7X9uYZyfM@ep-royal-tree-apkh3fb9.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function iniciarBaseDeDatos() {
    // 1. TABLA CLIENTES
    await pool.query(`
        CREATE TABLE IF NOT EXISTS clientes (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            saldo_usd REAL DEFAULT 0.00
        );
    `);

    // 2. TABLA PRODUCTOS
    await pool.query(`
        CREATE TABLE IF NOT EXISTS productos (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            precio_usd REAL NOT NULL
        );
    `);

    // 3. TABLA TRANSACCIONES
    await pool.query(`
        CREATE TABLE IF NOT EXISTS transacciones (
            id SERIAL PRIMARY KEY,
            cliente_id INTEGER,
            chofer TEXT NOT NULL, 
            producto_id INTEGER,
            cajas_despachadas INTEGER NOT NULL,
            vacios_recibidos INTEGER NOT NULL,
            monto_generado_usd REAL NOT NULL,
            monto_pagado_usd REAL DEFAULT 0.00,
            tasa_bcv REAL DEFAULT 1.00,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes (id),
            FOREIGN KEY (producto_id) REFERENCES productos (id)
        );
    `);

    // 4. TABLA USUARIOS
    await pool.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            rol TEXT NOT NULL
        );
    `);

    // --- ENRUTAMIENTO DE DATOS INICIALES ---
    
    // Crear administrador por defecto si la base de datos está en blanco
    const adminExiste = await pool.query("SELECT * FROM usuarios WHERE username = 'admin'");
    if (adminExiste.rowCount === 0) {
        const passwordEncriptada = await bcrypt.hash('123456', 10);
        await pool.query("INSERT INTO usuarios (username, password, rol) VALUES ($1, $2, $3)", ['admin', passwordEncriptada, 'admin']);
    }

    // Insertar catálogo oficial si está vacío
    const productosExisten = await pool.query("SELECT count(*) as count FROM productos");
    if (parseInt(productosExisten.rows[0].count) === 0) {
        await pool.query("INSERT INTO productos (nombre, precio_usd) VALUES ($1, $2)", ['Caja Polar Pilsen 36', 5.50]);
        await pool.query("INSERT INTO productos (nombre, precio_usd) VALUES ($1, $2)", ['Caja Solera Verde', 6.00]);
        await pool.query("INSERT INTO productos (nombre, precio_usd) VALUES ($1, $2)", ['Caja Maltín Polar', 4.50]);
        console.log("📦 Catálogo de productos oficial inyectado en la nube.");
    }

    console.log("🧠 ¡Base de datos PostgreSQL en Neon conectada exitosamente!");
    return pool;
}

// Exportamos un objeto simulado para que index.js no sufra cambios drásticos
module.exports = iniciarBaseDeDatos;