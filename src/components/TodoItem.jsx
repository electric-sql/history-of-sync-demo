import React from "react"
import { Flex, Checkbox, Text, Button } from "@radix-ui/themes"
import PropTypes from "prop-types"

/**
 * TodoItem component displays a single todo item with a checkbox, title, and delete button
 * @param {Object} props
 * @param {Object} props.todo - The todo item object
 * @param {string} props.todo.id - Unique identifier for the todo
 * @param {string} props.todo.title - Title of the todo
 * @param {boolean} props.todo.completed - Whether the todo is completed
 */
export const TodoItem = ({ todo }) => {
  return (
    <Flex
      align="center"
      justify="between"
      py="2"
      px="3"
      style={{
        borderBottom: "1px solid var(--gray-4)",
        backgroundColor: todo.completed ? "var(--gray-2)" : "white",
      }}
    >
      <Flex align="center" gap="2">
        <Checkbox checked={todo.completed} readOnly />

        <Text
          size="2"
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            color: todo.completed ? "var(--gray-9)" : "var(--gray-12)",
          }}
        >
          {todo.title}
        </Text>
      </Flex>

      <Button color="red" variant="soft" size="1">
        Delete
      </Button>
    </Flex>
  )
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
}

export default TodoItem
