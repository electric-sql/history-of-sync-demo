import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { logger } from "hono/logger"
import todosRouter from "./routes/todos.js"
import auditLogsRouter from "./routes/audit-logs.js"
// eslint-disable-next-line
import { db } from "./db/index.js"
import formPostApp from "../src/examples/01-FormPost/index.js"

// Create a new Hono app
const app = new Hono()

// Add middleware
app.use("*", logger())

// Add a simple ping endpoint
app.get("/ping", (c) => {
  return c.text("pong")
})

// Mount the routers
app.route("/api/todos", todosRouter)
app.route("/api/audit-logs", auditLogsRouter)

// Mount the form post example app
app.route("/form-post", formPostApp)

// Start the server
const port = 4001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
