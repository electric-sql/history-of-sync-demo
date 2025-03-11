import React from "react"
import { diffLines } from "diff"
import PropTypes from "prop-types"

/**
 * DiffView component displays a visual diff between two JSON objects
 * @param {Object} props
 * @param {Object} props.oldValue - The previous value
 * @param {Object} props.newValue - The new value
 */
export const DiffView = ({ oldValue, newValue }) => {
  const diff = diffLines(
    JSON.stringify(oldValue, null, 2),
    JSON.stringify(newValue, null, 2)
  )

  return (
    <pre
      style={{
        fontSize: "12px",
        fontFamily: "monospace",
        backgroundColor: "var(--gray-2)",
        padding: "8px",
        borderRadius: "4px",
        overflow: "auto",
        maxHeight: "300px",
      }}
    >
      {diff.map((part, index) => (
        <div
          key={index}
          style={{
            backgroundColor: part.added
              ? "var(--green-2)"
              : part.removed
                ? "var(--red-2)"
                : "transparent",
            color: part.added
              ? "var(--green-11)"
              : part.removed
                ? "var(--red-11)"
                : "var(--gray-12)",
            borderLeft: part.added
              ? "4px solid var(--green-9)"
              : part.removed
                ? "4px solid var(--red-9)"
                : "none",
            paddingLeft: "8px",
            whiteSpace: "pre",
          }}
        >
          {part.added ? "+ " : part.removed ? "- " : "  "}
          {part.value}
        </div>
      ))}
    </pre>
  )
}

DiffView.propTypes = {
  oldValue: PropTypes.any,
  newValue: PropTypes.any,
}

export default DiffView
