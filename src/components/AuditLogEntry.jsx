import React from "react"
import { Box, Flex, Text } from "@radix-ui/themes"
import PropTypes from "prop-types"
import DiffView from "./DiffView"

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

  // Determine what to display based on the event type
  const renderDiff = () => {
    // For creation events, there's no oldData
    if (log.event === "TODO_CREATED") {
      return (
        <Box>
          <Text as="div" color="gray" size="1" mb="1">
            Created:
          </Text>
          <DiffView oldValue={{}} newValue={log.newData} />
        </Box>
      )
    }

    // For deletion events, there's no newData
    if (log.event === "TODO_DELETED") {
      return (
        <Box>
          <Text as="div" color="gray" size="1" mb="1">
            Deleted:
          </Text>
          <DiffView oldValue={log.oldData} newValue={{}} />
        </Box>
      )
    }

    // For update events, show the diff between oldData and newData
    return (
      <Box>
        <Text as="div" color="gray" size="1" mb="1">
          Changes:
        </Text>
        <DiffView oldValue={log.oldData} newValue={log.newData} />
      </Box>
    )
  }

  return (
    <Box>
      <Flex mb="3" justify="between" align="center">
        <Text color="blue" weight="bold" size="2">
          {log.event}
        </Text>
        <Text color="gray" size="1">
          {formatTimestamp(log.timestamp)}
        </Text>
      </Flex>

      {(log.oldData || log.newData) && renderDiff()}
    </Box>
  )
}

AuditLogEntry.propTypes = {
  log: PropTypes.shape({
    event: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    oldData: PropTypes.object,
    newData: PropTypes.object,
    entityId: PropTypes.string,
    entityType: PropTypes.string,
  }).isRequired,
}

export default AuditLogEntry
