import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema.js"

// Create a PostgreSQL connection
const url =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || "password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "54321"}/${process.env.DB_NAME || "electric"}`

// Create a postgres.js client
const client = postgres(url)

// Create a Drizzle ORM instance
export const db = drizzle(client, { schema })
