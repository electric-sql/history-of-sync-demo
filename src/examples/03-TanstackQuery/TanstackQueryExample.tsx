import React, { useState, useEffect } from "react"
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
import api from "../../utils/api"
import { Todo } from "../../utils/api" // Import Todo type

// Create a client
const queryClient = new QueryClient()

// Wrapper component to provide the QueryClientProvider
const TanstackQueryExample: React.FC = () => {
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
const TanstackQueryContent: React.FC = () => {
  const [newTodoTitle, setNewTodoTitle] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isErrorToastOpen, setIsErrorToastOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()

  // Function to show error toast
  const showError = (message: string): void => {
    setErrorMessage(message)
    setIsErrorToastOpen(true)
  }

  // Use TanStack Query hooks for data fetching
  const {
    data: todos = [],
    isLoading: isTodosLoading,
    error: todosError,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: api.fetchTodos,
  })

  const {
    data: logs = [],
    isLoading: isLogsLoading,
    error: logsError,
  } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: api.fetchAuditLogs,
  })

  // Handle errors from queries
  useEffect(() => {
    if (todosError) showError((todosError as Error).message)
    if (logsError) showError((logsError as Error).message)
  }, [todosError, logsError])

  // Create Todo Mutation with optimistic updates
  const createTodoMutation = useMutation({
    mutationFn: (title: string) => api.createTodo(title),
    // Add optimistic update
    onMutate: async (title: string) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["todos"] })

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]) || []

      // Create an optimistic todo
      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`, // Temporary ID until server responds
        title,
        is_complete: false,
        created_at: new Date(),
        updated_at: new Date(),
      }

      // Optimistically update the cache
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => [
        ...old,
        optimisticTodo,
      ])

      // Return context with the previous value
      return { previousTodos }
    },
    onError: (error, _, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
      console.error("Error creating todo:", error)
      showError((error as Error).message)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] })
      // Clear the input field
      setNewTodoTitle("")
    },
  })

  // Toggle Todo Completion Mutation with optimistic updates
  const toggleTodoMutation = useMutation({
    mutationFn: (todo: Todo) => {
      return api.updateTodo(todo.id, { is_complete: !todo.is_complete })
    },
    // Add optimistic update
    onMutate: async (todo: Todo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] })

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]) || []

      // Optimistically update the cache
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((t) =>
          t.id === todo.id ? { ...t, is_complete: !t.is_complete } : t
        )
      )

      // Return context with the previous value
      return { previousTodos }
    },
    onError: (error, _, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
      console.error("Error updating todo:", error)
      showError((error as Error).message)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] })
    },
  })

  // Delete Todo Mutation with optimistic updates
  const deleteTodoMutation = useMutation({
    mutationFn: ({ id: todoId }: { id: string }) => api.deleteTodo(todoId),
    // Add optimistic update
    onMutate: async ({ id: todoId }: { id: string }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos"] })

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]) || []

      // Optimistically update the cache
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.filter((t) => t.id !== todoId)
      )

      // Return context with the previous value
      return { previousTodos }
    },
    onError: (error, _, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
      console.error("Error deleting todo:", error)
      showError((error as Error).message)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] })
    },
  })

  // Function to create a new todo
  const createTodo = (e: React.FormEvent): void => {
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
            onToggleComplete={toggleTodoMutation.mutate}
            onDelete={deleteTodoMutation.mutate}
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

export default TanstackQueryExample
