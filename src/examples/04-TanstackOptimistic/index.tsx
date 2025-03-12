import React, { useState } from "react"
import { Flex, Heading, TextField, Button, Grid } from "@radix-ui/themes"
import {
  useCollection,
  createElectricSync,
  Collection,
} from "@kylemathews/optimistic/react-electric"
import TodoList from "../../components/TodoList"
import AuditLog from "../../components/AuditLog"
// import ErrorToast from "../../components/ErrorToast"
import {
  todoUpdateSchema,
  Todo,
  auditLogsUpdateSchema,
  AuditLog as AuditLogType,
} from "../../../server/db/schema.ts"

/**
 * TanstackOpimisticExample component demonstrates sync data between the client and server
 * using @tanstack/optimistic & ElectricSQL.
 */
const TanstackOptimisticExample = () => {
  const [newTodoTitle, setNewTodoTitle] = useState(``)

  const {
    data: todos,
    insert: insertTodo,
    update: updateTodo,
    delete: deleteTodo,
  } = useCollection<Todo>({
    id: `todos`,
    sync: createElectricSync(
      {
        url: `http://localhost:3000/v1/shape`,
        params: {
          table: `todos`,
        },
        parser: {
          timestamptz: (date) => {
            return new Date(date)
          },
        },
      },
      { primaryKey: [`id`] }
    ),
    mutationFn: {
      persist: async ({ transaction }) => {
        console.log({ transaction: transaction.toObject() })
        for (const mutation of transaction.mutations) {
          console.log(`type`, mutation.type)
          if (mutation.type === `insert`) {
            const response = await fetch("/api/todos", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ title: mutation.changes.title }),
            })

            if (!response.ok) {
              // Handle the "slow" error specifically
              if (response.status === 429) {
                throw new Error("Too many requests. Please try again later.")
              }

              const errorData = await response.json().catch(() => ({}))
              throw new Error(
                errorData.message ||
                  `Failed to create todo: ${response.statusText}`
              )
            }

            const result = await response.json()
            return {
              txid: result.txid,
            }
          } else if (mutation.type === `update`) {
            const response = await fetch(`/api/todos/${mutation.original.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ...mutation.changes }),
            })

            if (!response.ok) {
              // Handle the "slow" error specifically
              if (response.status === 429) {
                throw new Error("Too many requests. Please try again later.")
              }

              const errorData = await response.json().catch(() => ({}))
              throw new Error(
                errorData.message ||
                  `Failed to create todo: ${response.statusText}`
              )
            }

            const result = await response.json()
            return {
              txid: result.txid,
            }
          } else if (mutation.type === `delete`) {
            const response = await fetch(`/api/todos/${mutation.original.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })

            if (!response.ok) {
              // Handle the "slow" error specifically
              if (response.status === 429) {
                throw new Error("Too many requests. Please try again later.")
              }

              const errorData = await response.json().catch(() => ({}))
              throw new Error(
                errorData.message ||
                  `Failed to create todo: ${response.statusText}`
              )
            }

            const result = await response.json()
            return {
              txid: result.txid,
            }
          } else {
            throw new Error(`not implemented`)
          }
        }
      },
      awaitSync: async ({
        persistResult,
        collection,
      }: {
        persistResult: { txid: number }
        collection: Collection
      }) => {
        console.log({ persistResult })
        // Start waiting for the txid
        await collection.config.sync.awaitTxid(persistResult.txid)
      },
    },
    schema: todoUpdateSchema,
  })
  const { data: logs } = useCollection<AuditLogType>({
    id: `audit-logs`,
    sync: createElectricSync(
      {
        url: `http://localhost:3000/v1/shape`,
        params: {
          table: `audit_logs`,
        },
        parser: {
          jsonb: (str) => {
            // Drizzle seems to be double-stringifying JSON data 🤔 but just for inserts
            const result = JSON.parse(str)
            if (typeof result === `string`) {
              return JSON.parse(result)
            } else {
              return result
            }
          },
        },
      },
      { primaryKey: [`id`] }
    ),
    mutationFn: {
      persist: async () => {
        return Promise.resolve()
      },
      awaitSync: async () => {
        return Promise.resolve()
      },
    },
    schema: auditLogsUpdateSchema,
  })

  return (
    <Flex direction="column" gap="5">
      <Heading size="6" mb="4">
        @tanstack/optimistic (with ElectricSQL) Example
      </Heading>

      <Flex direction="column" gap="5">
        <Heading size="4">Add New Todo</Heading>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            insertTodo({
              id: crypto.randomUUID(),
              title: newTodoTitle,
              is_complete: false,
              created_at: new Date(),
              updated_at: new Date(),
            })

            // Clear the input field
            setNewTodoTitle("")
          }}
        >
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

      <Grid columns="2" gap="6">
        <Flex direction="column" gap="5">
          <Heading size="4">Todos</Heading>
          <TodoList
            todos={todos}
            onToggleComplete={(todo) =>
              updateTodo(todo, (draft) => {
                console.log({ draft })
                draft.is_complete = !draft.is_complete
              })
            }
            onDelete={(todo) => {
              console.log(`implement`, todo)
              deleteTodo(todo)
            }}
          />
        </Flex>

        <Flex direction="column" gap="5">
          <Heading size="4">Audit Log</Heading>
          <AuditLog logs={logs} />
        </Flex>
      </Grid>
    </Flex>
  )
}
//
// <ErrorToast
//   message={errorMessage}
//   open={isErrorToastOpen}
//   onOpenChange={setIsErrorToastOpen}
//   duration={5000}
// />

export default TanstackOptimisticExample
