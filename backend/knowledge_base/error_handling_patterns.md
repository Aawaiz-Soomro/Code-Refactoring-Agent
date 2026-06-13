# Error Handling Guidelines

## Structured Error Response
- **Rule ERR-001**: All error responses returned to the client must follow a unified structure. Never return arbitrary strings or stack traces.
- **Rule ERR-002**: Format error JSON payloads as:
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable error description",
      "details": {}
    }
  }
  ```

## Exception Handling Practices
- **Rule ERR-003**: Never use bare `except:` or catch-all `Exception` classes without logging the trace and translating it into a client-safe response.
- **Rule ERR-004**: Avoid silent failure (suppressing exceptions). Always log error occurrences using a logger module at log level `ERROR` or `CRITICAL`.
- **Rule ERR-005**: If database operations fail, ensure active transactions are rolled back to prevent connection locks.

## Information Leakage
- **Rule ERR-006**: Do not leak internal system details, server file paths, database queries, database structure, or API keys in error messages returned to the client.
- **Rule ERR-007**: Ensure debug configurations (`debug=True` or stack trace rendering) are disabled in production environments.
