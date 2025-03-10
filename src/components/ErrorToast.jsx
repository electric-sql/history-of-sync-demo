import React from "react"
import * as Toast from "@radix-ui/react-toast"
import { Flex, Box, Text, IconButton } from "@radix-ui/themes"
import PropTypes from "prop-types"
import "./ErrorToast.css"

/**
 * ErrorToast component displays an error message in a toast notification
 * @param {Object} props
 * @param {string} props.message - The error message to display
 * @param {boolean} props.open - Whether the toast is open
 * @param {Function} props.onOpenChange - Function to call when the open state changes
 * @param {number} props.duration - Duration in milliseconds to show the toast (default: 5000)
 */
export const ErrorToast = ({
  message,
  open = false,
  onOpenChange,
  duration = 5000,
}) => {
  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        className="error-toast"
        open={open}
        onOpenChange={onOpenChange}
        duration={duration}
      >
        <Flex justify="between" align="center" gap="3">
          <Box>
            <Text as="div" weight="bold" size="2" color="red">
              Error
            </Text>
            <Text as="div" size="2" color="gray">
              {message}
            </Text>
          </Box>
          <Toast.Action asChild altText="Close">
            <IconButton variant="ghost" color="gray" radius="full" size="1">
              ✕
            </IconButton>
          </Toast.Action>
        </Flex>
      </Toast.Root>
      <Toast.Viewport className="error-toast-viewport" />
    </Toast.Provider>
  )
}

/**
 * Example usage:
 *
 * const [open, setOpen] = useState(false);
 * const [errorMessage, setErrorMessage] = useState('');
 *
 * const showError = (message) => {
 *   setErrorMessage(message);
 *   setOpen(true);
 * };
 *
 * return (
 *   <>
 *     <button onClick={() => showError('Something went wrong!')}>Show Error</button>
 *     <ErrorToast
 *       message={errorMessage}
 *       open={open}
 *       onOpenChange={setOpen}
 *     />
 *   </>
 * );
 */

ErrorToast.propTypes = {
  message: PropTypes.string.isRequired,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func.isRequired,
  duration: PropTypes.number,
}

export default ErrorToast
