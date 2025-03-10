import { Hono } from "hono"
import { html } from "hono/html"
import { db } from "../../../server/db/index.js"
import { todos, audit_logs } from "../../../server/db/schema.js"

// Define types for our data
interface Todo {
  id: string
  title: string
  is_complete: boolean
  created_at: string
  updated_at: string
}

interface AuditLog {
  id: string
  event_name: string
  timestamp: Date
  old_values: Todo | null
  new_values: Todo | null
  entity_id: string | null
  entity_type: string | null
}

const formPostApp = new Hono()

// GET / - Render the form page with todos and audit logs
formPostApp.get("/", async (c) => {
  try {
    // Fetch all todos
    const allTodos = await db.select().from(todos)

    // Fetch all audit logs
    const logs = await db
      .select()
      .from(audit_logs)
      .orderBy(audit_logs.timestamp)

    // Format date for display
    const formatDate = (date: Date) => {
      return date.toLocaleString()
    }

    // Render HTML response
    return c.html(html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Todo App - Form Post Example</title>
          <style>
            body {
              font-family:
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Roboto,
                sans-serif;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
            }
            .container {
              display: flex;
              gap: 30px;
            }
            .todos,
            .audit-logs {
              flex: 1;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 20px;
              background-color: #f9f9f9;
            }
            form {
              margin-bottom: 20px;
            }
            input[type="text"] {
              width: 70%;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            button {
              padding: 8px 16px;
              background-color: #4caf50;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            button:hover {
              background-color: #45a049;
            }
            ul {
              list-style-type: none;
              padding: 0;
            }
            li {
              padding: 10px;
              border-bottom: 1px solid #ddd;
              display: flex;
              align-items: center;
            }
            li:last-child {
              border-bottom: none;
            }
            input[type="checkbox"] {
              margin-right: 10px;
            }
            .todo-title {
              flex-grow: 1;
              text-decoration: none;
            }
            .todo-complete .todo-title {
              text-decoration: line-through;
              color: #888;
            }
            .delete-btn {
              background-color: #f44336;
              margin-left: 10px;
            }
            .delete-btn:hover {
              background-color: #d32f2f;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .error {
              color: red;
              background-color: #ffebee;
              padding: 10px;
              border-radius: 4px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <h1>Todo App - Form Post Example</h1>

          <div class="container">
            <div class="todos">
              <h2>Todos</h2>

              <!-- Error message display -->
              ${c.req.query("error")
                ? html`<div class="error">${c.req.query("error")}</div>`
                : ""}

              <!-- Todo form -->
              <form method="POST" action="/api/todos">
                <input
                  type="text"
                  name="title"
                  placeholder="Add a new todo..."
                  required
                />
                <button type="submit">Add Todo</button>
              </form>

              <!-- Todo list -->
              <ul>
                ${allTodos.map(
                  (todo) => html`
                    <li class="${todo.is_complete ? "todo-complete" : ""}">
                      <form
                        method="POST"
                        action="/api/todos/${todo.id}?_method=PUT"
                        style="display: flex; align-items: center; width: 100%;"
                      >
                        <input
                          type="checkbox"
                          name="is_complete"
                          ${todo.is_complete ? "checked" : ""}
                          onchange="this.form.submit()"
                        />
                        <input
                          type="hidden"
                          name="title"
                          value="${todo.title}"
                        />
                        <span class="todo-title">${todo.title}</span>
                        <button
                          type="submit"
                          class="delete-btn"
                          formaction="/api/todos/${todo.id}?_method=DELETE"
                        >
                          Delete
                        </button>
                      </form>
                    </li>
                  `
                )}
              </ul>
            </div>

            <div class="audit-logs">
              <h2>Audit Logs</h2>
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Timestamp</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map((log) => {
                    // Type cast the log values
                    const typedLog: AuditLog = {
                      ...log,
                      old_values: log.old_values as Todo | null,
                      new_values: log.new_values as Todo | null,
                    }

                    return html`
                      <tr>
                        <td>${typedLog.event_name}</td>
                        <td>${formatDate(typedLog.timestamp)}</td>
                        <td>
                          ${typedLog.event_name === "TODO_CREATED" &&
                          typedLog.new_values
                            ? html`Created: "${typedLog.new_values.title}"`
                            : typedLog.event_name === "TODO_UPDATED" &&
                                typedLog.old_values &&
                                typedLog.new_values
                              ? html`Updated: "${typedLog.old_values.title}"
                                ${typedLog.old_values.is_complete !==
                                typedLog.new_values.is_complete
                                  ? typedLog.new_values.is_complete
                                    ? "→ marked complete"
                                    : "→ marked incomplete"
                                  : ""}`
                              : typedLog.event_name === "TODO_DELETED" &&
                                  typedLog.old_values
                                ? html`Deleted: "${typedLog.old_values.title}"`
                                : ""}
                        </td>
                      </tr>
                    `
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `)
  } catch (error) {
    console.error("Error rendering form page:", error)
    return c.html(html`
      <html>
        <body>
          <h1>Error</h1>
          <p>Failed to load the page. Please try again later.</p>
        </body>
      </html>
    `)
  }
})

export default formPostApp
