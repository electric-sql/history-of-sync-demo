/**
 * Shared API client for making fetch requests to the backend
 * Centralizes error handling and request formatting
 */

/**
 * Interface for a Todo item
 */
export interface Todo {
  id: string
  title: string
  is_complete: boolean
  created_at: Date
  updated_at: Date
}

/**
 * Interface for an Audit Log entry
 */
export interface AuditLog {
  id: string
  entity_id: string
  entity_type: string
  event_name: string
  old_values: Record<string, unknown>
  new_values: Record<string, unknown>
  timestamp: Date
}

/**
 * Interface for API responses that include a transaction ID
 */
export interface ApiResponse {
  txid?: number
  [key: string]: unknown
}

/**
 * Base API request function with error handling
 *
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Response data
 */
const apiRequest = async <T>(
  url: string,
  options: globalThis.RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.")
      }

      // Try to parse error response
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message ||
          `Request failed: ${errorData?.error || response.statusText || response.status}`
      )
    }

    return response.json()
  } catch (error) {
    console.error(`API request error (${url}):`, error)
    throw error
  }
}

/**
 * API client with methods for common operations
 */
const api = {
  /**
   * Fetch all todos
   * @returns Todos array
   */
  fetchTodos: (): Promise<Todo[]> => apiRequest<Todo[]>("/api/todos"),

  /**
   * Fetch all audit logs
   * @returns Audit logs array
   */
  fetchAuditLogs: (): Promise<AuditLog[]> =>
    apiRequest<AuditLog[]>("/api/audit-logs"),

  /**
   * Create a new todo
   * @param title - Todo title
   * @returns Created todo
   */
  createTodo: (title: string): Promise<ApiResponse> =>
    apiRequest<ApiResponse>("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }),

  /**
   * Update a todo
   * @param todoId - Todo ID
   * @param updates - Fields to update
   * @returns Updated todo
   */
  updateTodo: (todoId: string, updates: Partial<Todo>): Promise<ApiResponse> =>
    apiRequest<ApiResponse>(`/api/todos/${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }),

  /**
   * Delete a todo
   * @param todoId - Todo ID
   * @returns Deletion result
   */
  deleteTodo: (todoId: string): Promise<ApiResponse> =>
    apiRequest<ApiResponse>(`/api/todos/${todoId}`, {
      method: "DELETE",
    }),
}

export default api
