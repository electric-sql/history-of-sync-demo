import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core"

// Todo items table
export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  is_complete: boolean("is_complete").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
})

// Audit log table
export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  event_name: text("event_name").notNull(), // 'TODO_CREATED', 'TODO_UPDATED', 'TODO_DELETED'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  old_values: jsonb("old_values"), // Previous state (null for create)
  new_values: jsonb("new_values"), // New state (null for delete)
  entity_id: uuid("entity_id"), // Reference to the affected todo
  entity_type: text("entity_type").default("todo"),
})
