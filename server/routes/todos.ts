import { Hono } from "hono"
import { db } from "../db/index.js"
import { todos, audit_logs } from "../db/schema.js"
import { eq, sql } from "drizzle-orm"

const todosRouter = new Hono()

// POST /api/todos/:id - Handle method override for HTML forms
todosRouter.post("/:id", async (c) => {
  const method = c.req.query("_method")?.toUpperCase()

  if (method === "PUT") {
    // Handle as PUT request
    const id = c.req.param("id")
    const formData = await c.req.parseBody()
    const title = formData.title as string | undefined
    const is_complete = formData.is_complete !== undefined

    // Update the todo
    try {
      // Use a transaction to ensure both operations succeed or fail together
      return await db.transaction(async (tx: typeof db) => {
        const todo = await tx.query.todos.findFirst({
          where: eq(todos.id, id),
        })

        if (!todo) {
          if (
            c.req
              .header("content-type")
              ?.includes("application/x-www-form-urlencoded")
          ) {
            return c.redirect(
              `/form-post?error=${encodeURIComponent("Todo not found")}`
            )
          }
          return c.json({ error: "Todo not found" }, 404)
        }

        // Update the todo
        await tx
          .update(todos)
          .set({
            title: title ?? todo.title,
            is_complete: is_complete,
            updated_at: new Date(),
          })
          .where(eq(todos.id, id))

        // Create audit log
        await tx.insert(audit_logs).values({
          id: crypto.randomUUID(),
          event_name: "TODO_UPDATED",
          timestamp: new Date(),
          old_values: {
            title: todo.title,
            is_complete: todo.is_complete,
          },
          new_values: {
            title: title ?? todo.title,
            is_complete,
          },
          entity_id: id,
          entity_type: "todo",
        })

        // Return the redirect response
        return c.redirect("/form-post")
      })

      // Redirect is now handled inside the transaction
    } catch (error) {
      console.error("Error updating todo:", error)
      return c.redirect(
        `/form-post?error=${encodeURIComponent("Error updating todo")}`
      )
    }
  } else if (method === "DELETE") {
    // Handle as DELETE request
    const id = c.req.param("id")

    try {
      // Use a transaction to ensure both operations succeed or fail together
      return await db.transaction(async (tx: typeof db) => {
        const todo = await tx.query.todos.findFirst({
          where: eq(todos.id, id),
        })

        if (!todo) {
          if (
            c.req
              .header("content-type")
              ?.includes("application/x-www-form-urlencoded")
          ) {
            return c.redirect(
              `/form-post?error=${encodeURIComponent("Todo not found")}`
            )
          }
          return c.json({ error: "Todo not found" }, 404)
        }

        // Delete the todo
        await tx.delete(todos).where(eq(todos.id, id))

        // Create audit log
        await tx.insert(audit_logs).values({
          id: crypto.randomUUID(),
          event_name: "TODO_DELETED",
          timestamp: new Date(),
          old_values: {
            title: todo.title,
            is_complete: todo.is_complete,
          },
          entity_id: id,
          entity_type: "todo",
        })

        // Return the redirect response
        return c.redirect("/form-post")
      })

      // Redirect is now handled inside the transaction
    } catch (error) {
      console.error("Error deleting todo:", error)
      return c.redirect(
        `/form-post?error=${encodeURIComponent("Error deleting todo")}`
      )
    }
  }

  // If no method override or unrecognized method, continue to next handler
  return c.text("Method not allowed", 405)
})

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
    // Check if the request is a form submission or JSON
    const contentType = c.req.header("content-type") || ""
    let title = ""

    if (contentType.includes("application/json")) {
      // Handle JSON request
      const body = await c.req.json()
      title = body.title
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      // Handle form submission
      const formData = await c.req.parseBody()
      title = formData.title as string
    } else {
      return c.json({ error: "Unsupported content type" }, 400)
    }

    // Reject if "slow" is in the title
    if (title.toLowerCase().includes("slow")) {
      // For form submissions, redirect back with error
      if (contentType.includes("application/x-www-form-urlencoded")) {
        return c.redirect(
          "/form-post?error=Cannot create todo with 'slow' in the title"
        )
      }
      return c.json(
        { error: "Cannot create todo with 'slow' in the title" },
        400
      )
    }

    // Use a transaction to ensure both operations succeed or fail together
    const newTodo = await db.transaction(async (tx: typeof db) => {
      // Insert the new todo
      const [createdTodo] = await tx
        .insert(todos)
        .values({
          title,
          is_complete: false,
        })
        .returning()

      // Create audit log entry
      await tx.insert(audit_logs).values({
        id: crypto.randomUUID(),
        event_name: "TODO_CREATED",
        timestamp: new Date(),
        new_values: JSON.stringify(createdTodo),
        entity_id: createdTodo.id,
        entity_type: "todo",
      })
      const [{ txid }] = await tx.execute(sql`SELECT txid_current() as txid`)

      return { createdTodo, txid: Number(txid) }
    })

    // For form submissions, redirect back to the form page
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return c.redirect("/form-post")
    }

    // For API requests, return JSON
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

    // Handle JSON request
    const body = await c.req.json()
    const title = body.title
    const is_complete = body.is_complete

    // Reject if "slow" is in the title
    if (title && title.toLowerCase().includes("slow")) {
      return c.json(
        { error: "Cannot update todo with 'slow' in the title" },
        400
      )
    }

    // Use a transaction to ensure both operations succeed or fail together
    const result = await db.transaction(async (tx: typeof db) => {
      // Get the old todo for audit log
      const [oldTodo] = await tx.select().from(todos).where(eq(todos.id, id))

      if (!oldTodo) {
        return { error: "Todo not found", status: 404 }
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
      const [updatedTodo] = await tx
        .update(todos)
        .set(updateValues)
        .where(eq(todos.id, id))
        .returning()

      // Create audit log entry
      await tx.insert(audit_logs).values({
        id: crypto.randomUUID(),
        event_name: "TODO_UPDATED",
        timestamp: new Date(),
        old_values: oldTodo,
        new_values: updatedTodo,
        entity_id: id,
        entity_type: "todo",
      })

      // Get the transaction ID
      const [{ txid }] = await tx.execute(sql`SELECT txid_current() as txid`)

      return { updatedTodo, txid: Number(txid) }
    })

    // Check if there was an error
    if ("error" in result) {
      return c.json({ error: result.error }, result.status)
    }

    return c.json(result)
  } catch (error) {
    console.error("Error updating todo:", error)
    return c.json({ error: "Failed to update todo" }, 500)
  }
})

// DELETE /api/todos/:id - Delete a todo
todosRouter.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id")

    // Use a transaction to ensure both operations succeed or fail together
    const result = await db.transaction(async (tx: typeof db) => {
      // Get the todo before deleting for audit log
      const [todoToDelete] = await tx
        .select()
        .from(todos)
        .where(eq(todos.id, id))

      if (!todoToDelete) {
        return { error: "Todo not found", status: 404 }
      }

      // Delete the todo
      await tx.delete(todos).where(eq(todos.id, id))

      // Create audit log entry
      await tx.insert(audit_logs).values({
        id: crypto.randomUUID(),
        event_name: "TODO_DELETED",
        timestamp: new Date(),
        old_values: todoToDelete,
        entity_id: id,
        entity_type: "todo",
      })

      // Get the transaction ID
      const [{ txid }] = await tx.execute(sql`SELECT txid_current() as txid`)

      return { success: true, txid: Number(txid) }
    })

    // Check if there was an error
    if ("error" in result) {
      return c.json({ error: result.error }, result.status)
    }

    return c.json(result)
  } catch (error) {
    console.error("Error deleting todo:", error)
    return c.json({ error: "Failed to delete todo" }, 500)
  }
})

export default todosRouter
