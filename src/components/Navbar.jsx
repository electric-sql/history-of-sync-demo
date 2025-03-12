import React from "react"
import { Link } from "@tanstack/react-router"
import { Flex, Text, Heading } from "@radix-ui/themes"
import PropTypes from "prop-types"

/**
 * Navbar component with links to all examples
 */
const Navbar = () => {
  return (
    <Flex direction="column" gap="5">
      <Heading size="4" weight="bold" color="gray12">
        <Link to="/" style={{ color: `inherit` }}>
          History of Sync Demo
        </Link>
      </Heading>
      <Flex gap="4" align="center">
        <a href="http://localhost:4001/form-post">
          <Text size="1">01-FormPost</Text>
        </a>
        <NavLink to="/examples/api-fetch">02-APIFetch</NavLink>
        <NavLink to="/examples/tanstack-query">03-TanstackQuery</NavLink>
        <NavLink to="/examples/tanstack-optimistic">
          04-TanstackOptimistic
        </NavLink>
      </Flex>
    </Flex>
  )
}

/**
 * NavLink component for consistent link styling using Radix UI components
 */
const NavLink = ({ to, children }) => (
  <Link
    to={to}
    style={{ textDecoration: "none" }}
    activeProps={{
      className: "active-link",
    }}
  >
    <Text size="1">{children}</Text>
  </Link>
)

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default Navbar
