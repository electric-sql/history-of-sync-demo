import React from "react"
import { Box, Flex, Text } from "@radix-ui/themes"
import PropTypes from "prop-types"
import DiffView from "./DiffView"

/**
 * AuditLogEntry component displays a single audit log entry with event name, timestamp, and data changes
 * @param {Object} props
 * @param {Object} props.log - The audit log entry
 * @param {string} props.log.event_name - The event name
 * @param {string} props.log.timestamp - The timestamp when the event occurred
 * @param {Object} props.log.old_values - The data before the change
 * @param {Object} props.log.new_values - The data after the change
 */
export const AuditLogEntry = ({ log }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  // Determine what to display based on the event type
  const renderDiff = () => {
    // For creation events, there's no oldData
    if (log.event_name === "TODO_CREATED") {
      return (
        <Box>
          <Text as="div" color="gray" size="1" mb="1">
            Created:
          </Text>
          <DiffView oldValue={{}} newValue={log.new_values} />
        </Box>
      )
    }

    // For deletion events, there's no new_values
    if (log.event_name === "TODO_DELETED") {
      return (
        <Box>
          <Text as="div" color="gray" size="1" mb="1">
            Deleted:
          </Text>
          <DiffView oldValue={log.old_values} newValue={{}} />
        </Box>
      )
    }

    // For update events, show the diff between old_values and new_values
    return (
      <Box>
        <Text as="div" color="gray" size="1" mb="1">
          Changes:
        </Text>
        <DiffView oldValue={log.old_values} newValue={log.new_values} />
      </Box>
    )
  }

  return (
    <Box>
      <Flex mb="3" justify="between" align="center">
        <Text color="blue" weight="bold" size="2">
          {log.event_name}
        </Text>
        <Text color="gray" size="1">
          {formatTimestamp(log.timestamp)}
        </Text>
      </Flex>

      {(log.old_values || log.new_values) && renderDiff()}
    </Box>
  )
}

AuditLogEntry.propTypes = {
  log: PropTypes.shape({
    event_name: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    old_values: PropTypes.object,
    new_values: PropTypes.object,
    entity_id: PropTypes.string,
    entity_type: PropTypes.string,
  }).isRequired,
}

export default AuditLogEntry
