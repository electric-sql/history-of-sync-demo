import React from "react"
import { Grid, Box, Heading } from "@radix-ui/themes"
import PropTypes from "prop-types"

/**
 * Layout component that sets up a side-by-side layout with left for todos and right for logs
 * @param {Object} props
 * @param {React.ReactNode} props.todoSection - Content for the todo section
 * @param {React.ReactNode} props.logSection - Content for the log section
 */
export const Layout = ({ todoSection, logSection }) => {
  return (
    <Grid columns={{ initial: "1", md: "2" }} gap="6">
      <Box>
        <Heading as="h2" size="4" mb="3">
          Todo List
        </Heading>
        {todoSection}
      </Box>

      <Box>
        <Heading as="h2" size="4" mb="3">
          Audit Logs
        </Heading>
        {logSection}
      </Box>
    </Grid>
  )
}

Layout.propTypes = {
  todoSection: PropTypes.node.isRequired,
  logSection: PropTypes.node.isRequired,
}

export default Layout
