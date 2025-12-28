import mysql from 'mysql2/promise'
import 'dotenv/config'

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Берет из .env, если нет - ставит localhost
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
