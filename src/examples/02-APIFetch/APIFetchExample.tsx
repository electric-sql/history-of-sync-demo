import React, { useState, useEffect } from "react"
import { Flex, Heading, TextField, Button, Grid } from "@radix-ui/themes"
import TodoList from "../../components/TodoList"
import AuditLog from "../../components/AuditLog"
import ErrorToast from "../../components/ErrorToast"
import api, { Todo, AuditLog as AuditLogType } from "../../utils/api"

/**
 * APIFetchExample component demonstrates fetching data from API endpoints
 * and updating the UI based on user interactions
 */
const APIFetchExample: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [logs, setLogs] = useState<AuditLogType[]>([])
  const [newTodoTitle, setNewTodoTitle] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isErrorToastOpen, setIsErrorToastOpen] = useState<boolean>(false)

  // Function to fetch todos from the API
  const fetchTodos = async (): Promise<void> => {
    try {
      const data = await api.fetchTodos()
      setTodos(data)
    } catch (error) {
      showError((error as Error).message)
    }
  }

  // Function to fetch audit logs from the API
  const fetchAuditLogs = async (): Promise<void> => {
    try {
      const data = await api.fetchAuditLogs()
      setLogs(data)
    } catch (error) {
      showError((error as Error).message)
    }
  }

  // Function to create a new todo
  const createTodo = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!newTodoTitle.trim()) {
      showError("Todo title cannot be empty")
      return
    }

    setIsLoading(true)

    try {
      await api.createTodo(newTodoTitle)

      // Clear the input field
      setNewTodoTitle("")

      // Refetch data to update the UI
      await Promise.all([fetchTodos(), fetchAuditLogs()])
    } catch (error) {
      showError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to toggle todo completion status
  const toggleTodoCompletion = async ({
    id: todoId,
    is_complete: currentStatus,
  }: {
    id: string
    is_complete: boolean
  }): Promise<void> => {
    try {
      await api.updateTodo(todoId, { is_complete: !currentStatus })

      // Refetch data to update the UI
      await Promise.all([fetchTodos(), fetchAuditLogs()])
    } catch (error) {
      showError((error as Error).message)
    }
  }

  // Function to delete a todo
  const deleteTodo = async ({ id: todoId }: { id: string }): Promise<void> => {
    try {
      await api.deleteTodo(todoId)

      // Refetch data to update the UI
      await Promise.all([fetchTodos(), fetchAuditLogs()])
    } catch (error) {
      showError((error as Error).message)
    }
  }

  // Function to show error toast
  const showError = (message: string): void => {
    setErrorMessage(message)
    setIsErrorToastOpen(true)
  }

  // Fetch todos and audit logs on component mount
  useEffect(() => {
    const loadInitialData = async (): Promise<void> => {
      setIsLoading(true)
      try {
        await Promise.all([fetchTodos(), fetchAuditLogs()])
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

      <Grid columns="2" gap="5">
        <Flex direction="column" gap="3">
          <Heading size="4">Todos</Heading>
          <TodoList
            todos={todos}
            onToggle={toggleTodoCompletion}
            onDelete={deleteTodo}
            isLoading={isLoading}
          />
        </Flex>
        <Flex direction="column" gap="3">
          <Heading size="4">Audit Log</Heading>
          <AuditLog logs={logs} isLoading={isLoading} />
        </Flex>
      </Grid>

      <ErrorToast
        message={errorMessage}
        open={isErrorToastOpen}
        onOpenChange={setIsErrorToastOpen}
      />
    </Flex>
  )
}

export default APIFetchExample
