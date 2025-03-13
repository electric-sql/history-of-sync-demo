import React from "react"
import { Card, Box, Text, Flex } from "@radix-ui/themes"
import PropTypes from "prop-types"
import { AuditLogEntry } from "./AuditLogEntry"

/**
 * AuditLog component renders a list of audit log entries
 * @param {Object} props
 * @param {Array} props.logs - Array of audit log objects
 */
export const AuditLog = ({ logs = [] }) => {
  if (logs.length === 0) {
    return (
      <Card size="2">
        <Box p="4">
          <Text color="gray" size="2">
            No activity recorded yet.
          </Text>
        </Box>
      </Card>
    )
  }

  logs.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))

  return (
    <Flex direction="column">
      {logs.map((log, index) => (
        <AuditLogEntry key={index} log={log} />
      ))}
    </Flex>
  )
}

AuditLog.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.object),
}

export default AuditLog
