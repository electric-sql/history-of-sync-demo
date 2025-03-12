import React from "react"
import { Flex, Checkbox, Text, Button } from "@radix-ui/themes"
import PropTypes from "prop-types"

/**
 * TodoItem component displays a single todo item with a checkbox, title, and delete button
 * @param {Object} props
 * @param {Object} props.todo - The todo item object
 * @param {string} props.todo.id - Unique identifier for the todo
 * @param {string} props.todo.title - Title of the todo
 * @param {boolean} props.todo.is_complete - Whether the todo is completed
 * @param {Function} props.onToggleComplete - Function to toggle todo completion status
 * @param {Function} props.onDelete - Function to delete a todo
 */
export const TodoItem = ({ todo, onToggleComplete, onDelete }) => {
  const handleToggle = () => {
    if (onToggleComplete) {
      onToggleComplete(todo)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(todo)
    }
  }

  return (
    <Flex align="center" justify="between">
      <Flex align="center" gap="2">
        <Checkbox checked={todo.is_complete} onClick={handleToggle} />

        <Text
          size="2"
          style={{
            textDecoration: todo.is_complete ? "line-through" : "none",
            color: todo.is_complete ? "var(--gray-9)" : "var(--gray-12)",
          }}
        >
          {todo.title}
        </Text>
      </Flex>

      <Button color="red" variant="soft" size="1" onClick={handleDelete}>
        Delete
      </Button>
    </Flex>
  )
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    is_complete: PropTypes.bool,
  }).isRequired,
  onToggleComplete: PropTypes.func,
  onDelete: PropTypes.func,
}

export default TodoItem
