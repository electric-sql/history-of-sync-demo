import React from "react"
import { Heading, Text, Flex } from "@radix-ui/themes"
import { Link } from "@tanstack/react-router"

/**
 * Home component that serves as the landing page
 */
const Home = () => {
  return (
    <Flex direction="column" gap="5">
      <Text color="gray">
        This project demonstrates the evolution of data persistence patterns in
        React applications
      </Text>

      <Flex direction="column" gap="4">
        <Link
          to="/examples/form-post"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Heading size="3" mb="2">
            01-FormPost
          </Heading>
          <Text color="gray">
            Traditional HTML form submission for creating todos with full page
            refresh
          </Text>
        </Link>

        <Link
          to="/examples/api-fetch"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Heading size="3" mb="2">
            02-APIFetch
          </Heading>
          <Text color="gray">
            React-based UI that makes fetch calls to the API with manual
            requerying
          </Text>
        </Link>

        <Link
          to="/examples/tanstack-query"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Heading size="3" mb="2">
            03-TanstackQuery
          </Heading>
          <Text color="gray">
            Implementation using Tanstack Query with automatic requerying after
            mutations
          </Text>
        </Link>

        <Link
          to="/examples/electric-sql"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Heading size="3" mb="2">
            04-ElectricSQL
          </Heading>
          <Text color="gray">
            Seamless synchronization with ElectricSQL and real-time sync between
            tabs
          </Text>
        </Link>

        <Link
          to="/examples/tanstack-optimistic"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Heading size="3" mb="2">
            05-TanstackOptimistic
          </Heading>
          <Text color="gray">
            Optimistic updates with immediate UI feedback before server
            confirmation
          </Text>
        </Link>
      </Flex>
    </Flex>
  )
}

export default Home
