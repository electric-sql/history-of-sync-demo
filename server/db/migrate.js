import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create a PostgreSQL connection
const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || "password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "54321"}/${process.env.DB_NAME || "electric"}`

// Create a postgres.js client for migrations
const sql = postgres(connectionString, { max: 1 })

// Initialize Drizzle ORM
const db = drizzle(sql)

// Run migrations
console.log("Running migrations...")
try {
  await migrate(db, { migrationsFolder: resolve(__dirname, "migrations") })
  console.log("Migrations completed successfully")
} catch (error) {
  console.error("Migration failed:", error)
  process.exit(1)
} finally {
  await sql.end()
}
