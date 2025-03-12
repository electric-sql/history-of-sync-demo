import React from "react"
import { Container, Flex } from "@radix-ui/themes"
import { Outlet } from "@tanstack/react-router"
import Navbar from "./Navbar"

/**
 * RootLayout component that wraps all pages with a common layout
 * including the navigation bar
 */
const RootLayout = () => {
  return (
    <Container size="4" align="center" pt="5">
      <Flex direction="column" gap="5">
        <Navbar />
        <Outlet />
      </Flex>
    </Container>
  )
}

export default RootLayout
