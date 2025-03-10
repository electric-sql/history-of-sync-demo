import React, { useState } from "react"
import { Theme, Button, Box } from "@radix-ui/themes"
import { TodoList, AuditLog, Layout, ErrorToast } from "./index"

/**
 * Demo component that shows how to use all the components together
 */
const Demo = () => {
  // Sample todos
  const [todos] = useState([
    { id: "1", title: "Learn React", completed: true },
    { id: "2", title: "Build a todo app", completed: false },
    { id: "3", title: "Deploy to production", completed: false },
  ])

  // Sample audit logs
  const [logs] = useState([
    {
      event: "TODO_CREATED",
      timestamp: "2025-03-10T15:30:00-06:00",
      newData: { id: "1", title: "Learn React", completed: false },
    },
    {
      event: "TODO_UPDATED",
      timestamp: "2025-03-10T15:35:00-06:00",
      oldData: { id: "1", title: "Learn React", completed: false },
      newData: { id: "1", title: "Learn React", completed: true },
    },
    {
      event: "TODO_CREATED",
      timestamp: "2025-03-10T15:40:00-06:00",
      newData: { id: "2", title: "Build a todo app", completed: false },
    },
    {
      event: "TODO_CREATED",
      timestamp: "2025-03-10T15:42:00-06:00",
      newData: { id: "3", title: "Deploy to production", completed: false },
    },
  ])

  // Error toast state
  const [toastOpen, setToastOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Function to show error toast
  const showError = (message) => {
    setErrorMessage(message)
    setToastOpen(true)
  }

  return (
    <Theme>
      <Box p="4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Box mb="6">
          <Button
            onClick={() =>
              showError("Something went wrong! This is a demo error message.")
            }
            color="red"
          >
            Show Error Toast
          </Button>
        </Box>

        <Layout
          todoSection={<TodoList todos={todos} />}
          logSection={<AuditLog logs={logs} />}
        />

        <ErrorToast
          message={errorMessage}
          open={toastOpen}
          onOpenChange={setToastOpen}
        />
      </Box>
    </Theme>
  )
}

export default Demo
