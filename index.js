import { Hono } from 'hono'
import { Database } from 'bun:sqlite'

// ========================================
// ABRIR O CREAR BASE DE DATOS SQLITE
// ========================================

const db = new Database('./base.sqlite3')

// Crear tabla si no existe
db.run(`
CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`)

// ========================================
// CREAR APP HONO
// ========================================

const app = new Hono()

// ========================================
// RUTA PRINCIPAL
// ========================================

app.get('/', (c) => {
    return c.json({ status: 'ok' })
})

// ========================================
// LOGIN
// ========================================

app.post('/login', async (c) => {
    return c.json({ status: 'ok' })
})

// ========================================
// INSERTAR NUEVA TAREA
// ========================================

app.post('/insert', async (c) => {

    let body

    // Verifica si llegó JSON
    try {
        body = await c.req.json()

    } catch {

        return c.json({
            error: 'Falta información necesaria'
        }, 400)
    }

    // Obtener valor "todo"
    const { todo } = body

    // Validar que exista
    if (!todo) {

        return c.json({
            error: 'Falta información necesaria'
        }, 400)
    }

    try {

        // Preparar INSERT
        const stmt = db.prepare(
            'INSERT INTO todos (todo) VALUES (?)'
        )

        // Ejecutar INSERT
        const result = stmt.run(todo)

        // Respuesta exitosa
        return c.json({
            id: Number(result.lastInsertRowid),
            message: 'Insert was successful'
        }, 201)

    } catch (err) {

        return c.json({
            error: err.message
        }, 500)
    }
})

// ========================================
// OBTENER TODAS LAS TAREAS
// ========================================

app.get('/todos', (c) => {

    try {

        // Ejecutar SELECT
        const todos = db
            .query('SELECT * FROM todos')
            .all()

        // Regresar datos JSON
        return c.json(todos)

    } catch (err) {

        return c.json({
            error: err.message
        }, 500)
    }
})

// ========================================
// EXPORTAR APP
// ========================================

export { app, db }

export default {
    port: process.env.PORT || 3000,
    fetch: app.fetch,
}
