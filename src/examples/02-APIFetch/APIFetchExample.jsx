import React, { useState, useEffect } from "react"
import { Flex, Heading, TextField, Button, Grid } from "@radix-ui/themes"
import TodoList from "../../components/TodoList"
import AuditLog from "../../components/AuditLog"
import ErrorToast from "../../components/ErrorToast"

/**
 * APIFetchExample component demonstrates fetching data from API endpoints
 * and updating the UI based on user interactions
 */
const APIFetchExample = () => {
  const [todos, setTodos] = useState([])
  const [logs, setLogs] = useState([])
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isErrorToastOpen, setIsErrorToastOpen] = useState(false)

  // Function to fetch todos from the API
  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos")
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`)
      }
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error("Error fetching todos:", error)
      showError(error.message)
    }
  }

  // Function to fetch audit logs from the API
  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("/api/audit-logs")
      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`)
      }
      const data = await response.json()

      // Map the database field names to what the AuditLogEntry component expects
      const mappedLogs = data.map((log) => ({
        event: log.event_name,
        timestamp: log.timestamp,
        oldData: log.old_values,
        newData: log.new_values,
        entityId: log.entity_id,
        entityType: log.entity_type,
      }))

      setLogs(mappedLogs)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      showError(error.message)
    }
  }

  // Function to create a new todo
  const createTodo = async (e) => {
    e.preventDefault()

    if (!newTodoTitle.trim()) {
      showError("Todo title cannot be empty")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTodoTitle }),
      })

      if (!response.ok) {
        // Handle the "slow" error specifically
        if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.")
        }

        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to create todo: ${response.statusText}`
        )
      }

      // Clear the input field
      setNewTodoTitle("")

      // Refetch data to update the UI
      await Promise.all([fetchTodos(), fetchAuditLogs()])
    } catch (error) {
      console.error("Error creating todo:", error)
      showError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to toggle todo completion status
  const toggleTodoCompletion = async (todoId, currentStatus) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_complete: !currentStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to update todo: ${response.statusText}`
        )
      }

      // Refetch data to update the UI
      await Promise.all([fetchTodos(), fetchAuditLogs()])
    } catch (error) {
      console.error("Error updating todo:", error)
      showError(error.message)
    }
  }

  // Function to delete a todo
  const deleteTodo = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to delete todo: ${response.statusText}`
        )
      }

      // Refetch data to update the UI
      await Promise.all([fetchTodos(), fetchAuditLogs()])
    } catch (error) {
      console.error("Error deleting todo:", error)
      showError(error.message)
    }
  }

  // Function to show error toast
  const showError = (message) => {
    setErrorMessage(message)
    setIsErrorToastOpen(true)
  }

  // Fetch todos and audit logs on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([fetchTodos(), fetchAuditLogs()])
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  return (
    <Flex direction="column" gap="5">
      <Heading size="6" mb="4">
        API Fetch Example
      </Heading>

      <Flex direction="column" gap="5">
        <Heading size="4">Add New Todo</Heading>
        <form onSubmit={createTodo}>
          <Flex gap="2">
            <TextField.Root
              size="3"
              style={{ flexGrow: 1 }}
              placeholder="Enter todo title..."
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Todo"}
            </Button>
          </Flex>
        </form>
      </Flex>

      <Grid columns="2" gap="6">
        <Flex direction="column" gap="5">
          <Heading size="4">Todos</Heading>
          <TodoList
            todos={todos}
            onToggleComplete={toggleTodoCompletion}
            onDelete={deleteTodo}
          />
        </Flex>

        <Flex direction="column" gap="5">
          <Heading size="4">Audit Log</Heading>
          <AuditLog logs={logs} />
        </Flex>
      </Grid>

      <ErrorToast
        message={errorMessage}
        open={isErrorToastOpen}
        onOpenChange={setIsErrorToastOpen}
        duration={5000}
      />
    </Flex>
  )
}

export default APIFetchExample
