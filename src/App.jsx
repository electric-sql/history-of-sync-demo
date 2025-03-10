import React from "react"
import "./App.css"
import "@radix-ui/themes/styles.css"
// Import the typography CSS file after Radix's CSS
import "../public/typography.css"
import "@fontsource/merriweather"
import "@fontsource/merriweather-sans"
import { Theme } from "@radix-ui/themes"
import Demo from "./components/Demo"

function App() {
  return (
    <Theme>
      <div className="app-container">
        <h1>React Components Demo</h1>
        <Demo />
      </div>
    </Theme>
  )
}

export default App
