import React from "react"
import "./App.css"
import "@radix-ui/themes/styles.css"
// Import the typography CSS file after Radix's CSS
import "../public/typography.css"
import "@fontsource/merriweather"
import "@fontsource/merriweather-sans"
import { Theme } from "@radix-ui/themes"
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router"

// Import layouts and components
import RootLayout from "./components/RootLayout"
import Home from "./components/Home"
import APIFetchExample from "./examples/02-APIFetch/APIFetchExample"
import FormPostExample from "./examples/01-FormPost/FormPostExample"

// Define routes
const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
})

const formPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/form-post",
  component: FormPostExample,
})

const apiFetchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/api-fetch",
  component: APIFetchExample,
})

// Placeholder routes for future examples
const tanstackQueryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/tanstack-query",
  component: () => (
    <div>
      <h1>TanStack Query Example</h1>
      <p>This example will be implemented in the future.</p>
    </div>
  ),
})

const tanstackQuerySideEffectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/tanstack-query-side-effects",
  component: () => (
    <div>
      <h1>TanStack Query with Side Effects Example</h1>
      <p>This example will be implemented in the future.</p>
    </div>
  ),
})

const electricSqlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/electric-sql",
  component: () => (
    <div>
      <h1>ElectricSQL Example</h1>
      <p>This example will be implemented in the future.</p>
    </div>
  ),
})

const tanstackOptimisticRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/examples/tanstack-optimistic",
  component: () => (
    <div>
      <h1>TanStack Optimistic Example</h1>
      <p>This example will be implemented in the future.</p>
    </div>
  ),
})

// Create the router
const routeTree = rootRoute.addChildren([
  indexRoute,
  formPostRoute,
  apiFetchRoute,
  tanstackQueryRoute,
  tanstackQuerySideEffectsRoute,
  electricSqlRoute,
  tanstackOptimisticRoute,
])

const router = createRouter({ routeTree })

function App() {
  return (
    <Theme>
      <RouterProvider router={router} />
    </Theme>
  )
}

export default App
