import React from "react"
import { Card, Box, Heading, Text } from "@radix-ui/themes"
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
        <Box p="4" style={{ textAlign: "center" }}>
          <Text color="gray" size="2">
            No activity recorded yet.
          </Text>
        </Box>
      </Card>
    )
  }

  return (
    <Card size="2" style={{ maxHeight: "600px", overflow: "auto" }}>
      <Box
        p="3"
        style={{
          backgroundColor: "var(--gray-2)",
          borderBottom: "1px solid var(--gray-4)",
        }}
      >
        <Heading size="3" as="h3">
          Activity Log
        </Heading>
      </Box>
      {logs.map((log, index) => (
        <AuditLogEntry key={index} log={log} />
      ))}
    </Card>
  )
}

AuditLog.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.object),
}

export default AuditLog
