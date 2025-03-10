import { createServer } from "@drizzle/studio"
import { resolve } from "path"
import { fileURLToPath } from "url"

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, "..")

// Database connection URL
const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER || "postgres"}:${
    process.env.DB_PASSWORD || "password"
  }@${process.env.DB_HOST || "localhost"}:${
    process.env.DB_PORT || "54321"
  }/${process.env.DB_NAME || "electric"}`

// Create and start the Drizzle Studio server
const server = await createServer({
  dialect: "postgresql",
  driver: {
    url: connectionString,
  },
  schema: resolve(__dirname, "schema.js"),
  port: 3333,
})

server.start()
console.log(`Drizzle Studio is running at: ${server.url}`)
