import express from 'express'
import cors from 'cors'
import { db } from './db'

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5200


// Проверка сервера
app.get('/api/health', (_, res) => {
  res.json({ ok: true })
})

// Пример запроса к MySQL
app.get('/api/users', async (_, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
})


app.get('/api/users', async (_, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
