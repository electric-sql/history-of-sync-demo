import React from "react"
import { Card, Box, Text, Flex } from "@radix-ui/themes"
import PropTypes from "prop-types"
import { TodoItem } from "./TodoItem"
import { Separator } from "@radix-ui/themes/dist/cjs/components/context-menu"

/**
 * TodoList component renders a list of todo items
 * @param {Object} props
 * @param {Array} props.todos - Array of todo objects
 * @param {Function} props.onToggleComplete - Function to toggle todo completion status
 * @param {Function} props.onDelete - Function to delete a todo
 */
export const TodoList = ({ todos = [], onToggleComplete, onDelete }) => {
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
    <Flex direction="column">
      {todos.map((todo) => (
        <div key={todo.id}>
          <TodoItem
            todo={todo}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
          />
          <Separator />
        </div>
      ))}
    </Flex>
  )
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      is_complete: PropTypes.bool,
    })
  ),
  onToggleComplete: PropTypes.func,
  onDelete: PropTypes.func,
}

export default TodoList
