import React, { useState } from "react"
import { Flex, Heading, TextField, Button, Grid } from "@radix-ui/themes"
import {
  useCollection,
  createElectricSync,
  Collection,
} from "@kylemathews/optimistic/react-electric"
import TodoList from "../../components/TodoList"
import AuditLog from "../../components/AuditLog"
import ErrorToast from "../../components/ErrorToast"
import {
  todoUpdateSchema,
  Todo,
  auditLogsUpdateSchema,
  AuditLog as AuditLogType,
} from "../../../server/db/schema.ts"
import api from "../../utils/api"

interface PersistResult {
  txid: number | undefined
}

/**
 * TanstackOptimisticExample component demonstrates sync data between the client and server
 * using @tanstack/optimistic & ElectricSQL.
 */
const TanstackOptimisticExample: React.FC = () => {
  const [newTodoTitle, setNewTodoTitle] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isErrorToastOpen, setIsErrorToastOpen] = useState<boolean>(false)

  // Function to show error toast
  const showError = (message: string): void => {
    setErrorMessage(message)
    setIsErrorToastOpen(true)
  }

  const {
    data: todos,
    insert: insertTodo,
    update: updateTodo,
    delete: deleteTodo,
  } = useCollection<Todo>({
    id: "todos",
    sync: createElectricSync(
      {
        url: "http://localhost:3000/v1/shape",
        params: {
          table: "todos",
        },
        parser: {
          timestamptz: (date: string): Date => {
            return new Date(date)
          },
        },
      },
      { primaryKey: ["id"] }
    ),
    mutationFn: {
      persist: async ({ transaction }): Promise<PersistResult> => {
        try {
          for (const mutation of transaction.mutations) {
            if (mutation.type === "insert") {
              const result = await api.createTodo(mutation.changes.title)
              return {
                txid: result.txid,
              }
            } else if (mutation.type === "update") {
              const result = await api.updateTodo(mutation.original.id, {
                ...mutation.changes,
              })
              return {
                txid: result.txid,
              }
            } else if (mutation.type === "delete") {
              const result = await api.deleteTodo(mutation.original.id)
              return {
                txid: result.txid,
              }
            } else {
              throw new Error("not implemented")
            }
          }

          // This should never be reached but is needed to satisfy TypeScript
          throw new Error("No mutations processed")
        } catch (error) {
          showError((error as Error).message)
          throw error
        }
      },
      awaitSync: async ({
        persistResult,
        collection,
      }: {
        persistResult: PersistResult
        collection: Collection
      }): Promise<void> => {
        // Start waiting for the txid
        if (persistResult.txid !== undefined) {
          await collection.config.sync.awaitTxid(persistResult.txid)
        }
      },
    },
    schema: todoUpdateSchema,
  })

  const { data: logs } = useCollection<AuditLogType>({
    id: "audit-logs",
    sync: createElectricSync(
      {
        url: "http://localhost:3000/v1/shape",
        params: {
          table: "audit_logs",
        },
        parser: {
          // Use type assertion to handle the jsonb parser
          jsonb: (str: string) => {
            // Drizzle seems to be double-stringifying JSON data 🤔 but just for inserts
            const result = JSON.parse(str)
            if (typeof result === "string") {
              return JSON.parse(result)
            } else {
              return result
            }
          },
        },
      },
      { primaryKey: ["id"] }
    ),
    mutationFn: {
      persist: async (): Promise<void> => {
        return Promise.resolve()
      },
      awaitSync: async (): Promise<void> => {
        return Promise.resolve()
      },
    },
    schema: auditLogsUpdateSchema,
  })

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    if (!newTodoTitle.trim()) {
      return
    }

    insertTodo({
      id: crypto.randomUUID(),
      title: newTodoTitle,
      is_complete: false,
      created_at: new Date(),
      updated_at: new Date(),
    })

    // Clear the input field
    setNewTodoTitle("")
  }

  const handleToggleComplete = (todo: Todo): void => {
    updateTodo(todo, (draft) => {
      draft.is_complete = !draft.is_complete
    })
  }

  const handleDelete = (todo: Todo): void => {
    deleteTodo(todo)
  }

  return (
    <Flex direction="column" gap="5">
      <Heading size="6" mb="4">
        @tanstack/optimistic (with ElectricSQL) Example
      </Heading>

      <Flex direction="column" gap="5">
        <Heading size="4">Add New Todo</Heading>
        <form onSubmit={handleSubmit}>
          <Flex gap="2">
            <TextField.Root
              size="3"
              style={{ flexGrow: 1 }}
              placeholder="Enter todo title..."
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
            />
            <Button type="submit">Add Todo</Button>
          </Flex>
        </form>
      </Flex>

      <Grid columns="2" gap="5">
        <Flex direction="column" gap="3">
          <Heading size="4">Todos</Heading>
          <TodoList
            todos={todos}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            isLoading={false}
          />
        </Flex>

        <Flex direction="column" gap="3">
          <Heading size="4">Audit Log</Heading>
          <AuditLog logs={logs} isLoading={false} />
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

export default TanstackOptimisticExample
