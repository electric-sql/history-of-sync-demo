import React from "react"
import { Box, Flex, Text, Code } from "@radix-ui/themes"
import PropTypes from "prop-types"

/**
 * AuditLogEntry component displays a single audit log entry with event name, timestamp, and data changes
 * @param {Object} props
 * @param {Object} props.log - The audit log entry
 * @param {string} props.log.event - The event name
 * @param {string} props.log.timestamp - The timestamp when the event occurred
 * @param {Object} props.log.oldData - The data before the change
 * @param {Object} props.log.newData - The data after the change
 */
export const AuditLogEntry = ({ log }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Box py="3" px="4" style={{ borderBottom: "1px solid var(--gray-4)" }}>
      <Flex justify="between" align="center" mb="2">
        <Text color="blue" weight="bold" size="2">
          {log.event}
        </Text>
        <Text color="gray" size="1">
          {formatTimestamp(log.timestamp)}
        </Text>
      </Flex>

      {log.oldData && (
        <Box mb="2">
          <Text as="div" color="gray" size="1" mb="1">
            Previous:
          </Text>
          <Code
            size="1"
            color="gray"
            style={{
              display: "block",
              padding: "var(--space-2)",
              borderRadius: "var(--radius-3)",
              backgroundColor: "var(--gray-2)",
              overflow: "auto",
            }}
          >
            {JSON.stringify(log.oldData, null, 2)}
          </Code>
        </Box>
      )}

      {log.newData && (
        <Box>
          <Text as="div" color="gray" size="1" mb="1">
            Current:
          </Text>
          <Code
            size="1"
            color="gray"
            style={{
              display: "block",
              padding: "var(--space-2)",
              borderRadius: "var(--radius-3)",
              backgroundColor: "var(--gray-2)",
              overflow: "auto",
            }}
          >
            {JSON.stringify(log.newData, null, 2)}
          </Code>
        </Box>
      )}
    </Box>
  )
}

AuditLogEntry.propTypes = {
  log: PropTypes.shape({
    event: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    oldData: PropTypes.object,
    newData: PropTypes.object,
  }).isRequired,
}

export default AuditLogEntry
