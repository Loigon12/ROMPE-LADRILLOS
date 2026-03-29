// --- BACKEND: Node.js con Express y PostgreSQL ---
const express = require('express'); // Framework web para Node.js
const cors = require('cors'); // CORS para permitir solicitudes desde el frontend
const { Pool } = require('pg'); // Cliente de PostgreSQL para Node.js   
const app = express(); // Crear instancia de Express
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Middleware para parsear JSON en las solicitudes

const pool = new Pool({
    user: process.env.DB_USER || 'postgres', // Usuario de la DB
    host: process.env.DB_HOST || 'db', // Host de la DB (nombre del servicio en Docker)
    database: process.env.DB_NAME || 'pacmandb', // Nombre de la DB
    password: process.env.DB_PASSWORD || 'secretpassword', // Contraseña de la DB
    port: 5432, // Puerto de PostgreSQL
});

// Función para inicializar la DB con reintentos
const initDB = async () => {
    try {
        // Intentamos conectar y crear la tabla si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS scores (
                id SERIAL PRIMARY KEY,
                player VARCHAR(50) NOT NULL,
                score INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Si llegamos aquí, la DB está lista
        console.log("Tabla 'scores' lista o ya existente.");
    } catch (err) {
        // Si hay un error, probablemente la DB aún no ha subido, así que reintentamos después de un tiempo
        console.error("Error conectando a la DB, reintentando en 3 segundos...", err.message);
        setTimeout(initDB, 3000); // Reintenta si la DB aún no ha subido
    }
};
// Llamamos a la función de inicialización de la DB al arrancar el servidor
initDB();

// Ruta para guardar la puntuación enviada desde el frontend
app.post('/api/score', async (req, res) => {
    // Extraemos los datos del cuerpo de la solicitud
    const { player, score } = req.body;
    try {
        // Verificamos que los datos lleguen
        if (!player || score === undefined) {
            return res.status(400).json({ error: 'Faltan datos' });
        }
        // Insertamos la puntuación en la tabla 'scores'
        await pool.query('INSERT INTO scores (player, score) VALUES ($1, $2)', [player, score]);
        // Respondemos con éxito si la inserción fue correcta
        res.status(201).json({ message: 'Puntuación guardada con éxito' });
    } catch (err) {
        // Si hay un error al insertar, lo registramos y respondemos con un error
        console.error("Error en INSERT:", err.message);
        // Respondemos con un error si no se pudo guardar la puntuación
        res.status(500).json({ error: 'No se pudo guardar la puntuación' });
    }
});
// Iniciamos el servidor en el puerto 3000
app.listen(3000, () => console.log('Backend listo en puerto 3000'));