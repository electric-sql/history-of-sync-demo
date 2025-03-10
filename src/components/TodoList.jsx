import React from "react"
import { Card, Box, Text } from "@radix-ui/themes"
import PropTypes from "prop-types"
import { TodoItem } from "./TodoItem"

/**
 * TodoList component renders a list of todo items
 * @param {Object} props
 * @param {Array} props.todos - Array of todo objects
 */
export const TodoList = ({ todos = [] }) => {
  if (todos.length === 0) {
    return (
      <Card size="2">
        <Box p="4" style={{ textAlign: "center" }}>
          <Text color="gray" size="2">
            No todos yet. Add one to get started!
          </Text>
        </Box>
      </Card>
    )
  }

  return (
    <Card size="2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </Card>
  )
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
    })
  ),
}

export default TodoList
