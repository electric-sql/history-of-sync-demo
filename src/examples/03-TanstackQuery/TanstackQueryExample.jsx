import React, { useState } from "react"
import { Flex, Heading, TextField, Button, Grid } from "@radix-ui/themes"
import TodoList from "../../components/TodoList"
import AuditLog from "../../components/AuditLog"
import ErrorToast from "../../components/ErrorToast"
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

// Create a client
const queryClient = new QueryClient()

// Wrapper component to provide the QueryClientProvider
const TanstackQueryExample = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TanstackQueryContent />
    </QueryClientProvider>
  )
}

/**
 * TanstackQueryContent component demonstrates using TanStack Query for API data fetching
 * and mutations, providing automatic caching, refetching, and optimistic updates
 */
const TanstackQueryContent = () => {
  const [newTodoTitle, setNewTodoTitle] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isErrorToastOpen, setIsErrorToastOpen] = useState(false)
  const queryClient = useQueryClient()

  // Function to show error toast
  const showError = (message) => {
    setErrorMessage(message)
    setIsErrorToastOpen(true)
  }

  // API functions
  const fetchTodosApi = async () => {
    const response = await fetch("/api/todos")
    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.statusText}`)
    }
    return response.json()
  }

  const fetchAuditLogsApi = async () => {
    const response = await fetch("/api/audit-logs")
    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.statusText}`)
    }
    return response.json()
  }

  // Use TanStack Query hooks for data fetching
  const {
    data: todos = [],
    isLoading: isTodosLoading,
    error: todosError,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodosApi,
  })

  const {
    data: logs = [],
    isLoading: isLogsLoading,
    error: logsError,
  } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: fetchAuditLogsApi,
  })

  // Handle errors from queries
  React.useEffect(() => {
    if (todosError) showError(todosError.message)
    if (logsError) showError(logsError.message)
  }, [todosError, logsError])

  // Create Todo Mutation
  const createTodoMutation = useMutation({
    mutationFn: async (title) => {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
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

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch todos and audit logs queries
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] })
      // Clear the input field
      setNewTodoTitle("")
    },
    onError: (error) => {
      console.error("Error creating todo:", error)
      showError(error.message)
    },
  })

  // Toggle Todo Completion Mutation
  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id: todoId, is_complete: currentStatus }) => {
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

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch todos and audit logs queries
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] })
    },
    onError: (error) => {
      console.error("Error updating todo:", error)
      showError(error.message)
    },
  })

  // Delete Todo Mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async ({ id: todoId }) => {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to delete todo: ${response.statusText}`
        )
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch todos and audit logs queries
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] })
    },
    onError: (error) => {
      console.error("Error deleting todo:", error)
      showError(error.message)
    },
  })

  // Function to create a new todo
  const createTodo = (e) => {
    e.preventDefault()

    if (!newTodoTitle.trim()) {
      showError("Todo title cannot be empty")
      return
    }

    createTodoMutation.mutate(newTodoTitle)
  }

  // Determine if any data loading is in progress
  const isLoading =
    isTodosLoading ||
    isLogsLoading ||
    createTodoMutation.isPending ||
    toggleTodoMutation.isPending ||
    deleteTodoMutation.isPending

  return (
    <Flex direction="column" gap="5">
      <Heading size="6" mb="4">
        TanStack Query Example
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
              {createTodoMutation.isPending ? "Adding..." : "Add Todo"}
            </Button>
          </Flex>
        </form>
      </Flex>

      <Grid columns="2" gap="6">
        <Flex direction="column" gap="5">
          <Heading size="4">Todos</Heading>
          <TodoList
            todos={todos}
            onToggleComplete={toggleTodoMutation.mutate}
            onDelete={deleteTodoMutation.mutate}
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

export default TanstackQueryExample
