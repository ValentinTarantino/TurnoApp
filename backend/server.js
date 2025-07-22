require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[EXPRESS LOG] Recibida petición: ${req.method} ${req.url}`);
    next();
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('[DB ERROR] Error al conectar a la base de datos:', err.stack);
    }
    console.log('[DB STATUS] Conectado a PostgreSQL exitosamente!');
    release();
});

app.get('/api/users/clients', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, nombre, role FROM users WHERE role = $1', ['cliente']);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener clientes:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener usuario por ID:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/users', async (req, res) => {
    const { id, email, nombre, role } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (id, email, nombre, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
            [id, email, nombre, role]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear usuario:', err.message);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'El usuario con este ID o email ya existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { especialidad, horarios } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET especialidad = $1, horarios = $2 WHERE id = $3 RETURNING *',
            [especialidad, horarios, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar usuario:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener todos los usuarios:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/turnos', async (req, res) => {
    const { paciente_id, estado } = req.query;
    let queryText = 'SELECT * FROM turnos';
    const queryParams = [];
    let whereClauses = [];

    if (paciente_id) {
        whereClauses.push(`paciente_id = $${whereClauses.length + 1}`);
        queryParams.push(paciente_id);
    }
    if (estado) {
        whereClauses.push(`estado = $${whereClauses.length + 1}`);
        queryParams.push(estado);
    }

    if (whereClauses.length > 0) {
        queryText += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    queryText += ' ORDER BY fecha DESC, hora DESC, fecha_creacion DESC';

    try {
        const result = await pool.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener turnos:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/turnos', async (req, res) => {
    const { paciente_id, paciente_nombre, profesional_id, fecha, hora, duracion, motivo, estado } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO turnos (paciente_id, paciente_nombre, profesional_id, fecha, hora, duracion, motivo, estado, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
            [paciente_id, paciente_nombre, profesional_id, fecha, hora, duracion, motivo, estado]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear turno:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/turnos/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha, hora, duracion, estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE turnos SET fecha = $1, hora = $2, duracion = $3, estado = $4 WHERE id = $5 RETURNING *',
            [fecha, hora, duracion, estado, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar turno:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/api/turnos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM turnos WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }
        res.status(200).json({ message: 'Turno eliminado exitosamente', id: result.rows[0].id });
    } catch (err) {
        console.error('Error al eliminar turno:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/notifications', async (req, res) => {
    const { user_id, mensaje } = req.body;
    if (!user_id || !mensaje) {
        return res.status(400).json({ error: 'Faltan user_id o mensaje para la notificación' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO notifications (user_id, mensaje, leida, fecha) VALUES ($1, $2, FALSE, NOW()) RETURNING *',
            [user_id, mensaje]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear notificación:', err.message, err.stack, 'SQL State:', err.code);
        res.status(500).json({ error: 'Error interno del servidor al crear notificación' });
    }
});

app.get('/api/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY fecha DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener notificaciones:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener notificaciones' });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE notifications SET leida = TRUE WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al marcar notificación como leída:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al marcar como leída' });
    }
});

app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
});