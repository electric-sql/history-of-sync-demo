import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"
import { createUpdateSchema } from "drizzle-zod"
import z from "zod"

// Todo items table
export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  is_complete: boolean("is_complete").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const todoUpdateSchema = createUpdateSchema(todos).strict()
export type Todo = z.infer<typeof todoUpdateSchema>

// Audit log table
export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  event_name: text("event_name").notNull(), // 'TODO_CREATED', 'TODO_UPDATED', 'TODO_DELETED'
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  old_values: jsonb("old_values"), // Previous state (null for create)
  new_values: jsonb("new_values"), // New state (null for delete)
  entity_id: uuid("entity_id"), // Reference to the affected todo
  entity_type: text("entity_type").default("todo"),
})

export const auditLogsUpdateSchema = createUpdateSchema(audit_logs).strict()
export type AuditLog = z.infer<typeof auditLogsUpdateSchema>
