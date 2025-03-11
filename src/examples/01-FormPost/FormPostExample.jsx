import React from "react"
import { Box, Heading, Text, Card } from "@radix-ui/themes"

/**
 * FormPostExample component that displays an iframe with the form post example
 */
const FormPostExample = () => {
  return (
    <Box>
      <Heading size="6" mb="4">
        01-FormPost Example
      </Heading>
      <Text mb="4">
        This example demonstrates traditional HTML form submission for creating
        todos with full page refresh. The server renders the complete page with
        the updated todo list and audit log.
      </Text>
      <Card size="2">
        <iframe src="/examples/01-FormPost" title="Form Post Example" />
      </Card>
    </Box>
  )
}

export default FormPostExample
