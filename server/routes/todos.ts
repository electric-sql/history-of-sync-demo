import { Hono } from "hono"
import { db } from "../db/index.js"
import { todos, audit_logs } from "../db/schema.js"
import { eq } from "drizzle-orm"

const todosRouter = new Hono()

// GET /api/todos - Get all todos
todosRouter.get("/", async (c) => {
  try {
    const allTodos = await db.select().from(todos)
    return c.json(allTodos)
  } catch (error) {
    console.error("Error fetching todos:", error)
    return c.json({ error: "Failed to fetch todos" }, 500)
  }
})

// POST /api/todos - Create a new todo
todosRouter.post("/", async (c) => {
  try {
    const body = await c.req.json()
    const { title } = body

    // Reject if "slow" is in the title
    if (title.toLowerCase().includes("slow")) {
      return c.json(
        { error: "Cannot create todo with 'slow' in the title" },
        400
      )
    }

    // Insert the new todo
    const [newTodo] = await db
      .insert(todos)
      .values({
        title,
        is_complete: false,
      })
      .returning()

    // Create audit log entry
    await db.insert(audit_logs).values({
      event_name: "TODO_CREATED",
      new_values: newTodo,
      entity_id: newTodo.id,
    })

    return c.json(newTodo, 201)
  } catch (error) {
    console.error("Error creating todo:", error)
    return c.json({ error: "Failed to create todo" }, 500)
  }
})

// PUT /api/todos/:id - Update a todo
todosRouter.put("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const body = await c.req.json()
    const { title, is_complete } = body

    // Reject if "slow" is in the title
    if (title && title.toLowerCase().includes("slow")) {
      return c.json(
        { error: "Cannot update todo with 'slow' in the title" },
        400
      )
    }

    // Get the old todo for audit log
    const [oldTodo] = await db.select().from(todos).where(eq(todos.id, id))

    if (!oldTodo) {
      return c.json({ error: "Todo not found" }, 404)
    }

    // Prepare update values
    const updateValues: {
      title?: string
      is_complete?: boolean
      updated_at: Date
    } = {
      updated_at: new Date(),
    }

    if (title !== undefined) updateValues.title = title
    if (is_complete !== undefined) updateValues.is_complete = is_complete

    // Update the todo
    const [updatedTodo] = await db
      .update(todos)
      .set(updateValues)
      .where(eq(todos.id, id))
      .returning()

    // Create audit log entry
    await db.insert(audit_logs).values({
      event_name: "TODO_UPDATED",
      old_values: oldTodo,
      new_values: updatedTodo,
      entity_id: id,
    })

    return c.json(updatedTodo)
  } catch (error) {
    console.error("Error updating todo:", error)
    return c.json({ error: "Failed to update todo" }, 500)
  }
})

// DELETE /api/todos/:id - Delete a todo
todosRouter.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id")

    // Get the todo before deleting for audit log
    const [todoToDelete] = await db.select().from(todos).where(eq(todos.id, id))

    if (!todoToDelete) {
      return c.json({ error: "Todo not found" }, 404)
    }

    // Delete the todo
    await db.delete(todos).where(eq(todos.id, id))

    // Create audit log entry
    await db.insert(audit_logs).values({
      event_name: "TODO_DELETED",
      old_values: todoToDelete,
      entity_id: id,
    })

    return c.json({ success: true })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return c.json({ error: "Failed to delete todo" }, 500)
  }
})

export default todosRouter
