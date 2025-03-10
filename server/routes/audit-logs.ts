import { Hono } from "hono"
import { db } from "../db/index.js"
import { audit_logs } from "../db/schema.js"

const auditLogsRouter = new Hono()

// GET /api/audit-logs - Get all audit logs
auditLogsRouter.get("/", async (c) => {
  try {
    const logs = await db
      .select()
      .from(audit_logs)
      .orderBy(audit_logs.timestamp)

    return c.json(logs)
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return c.json({ error: "Failed to fetch audit logs" }, 500)
  }
})

export default auditLogsRouter
