# API Design and Style Guide

## Endpoint Naming Conventions
- **Rule API-001**: Resource endpoints must use plural nouns (e.g., `/api/users`, `/api/articles`, not `/api/getUser` or `/api/view_article`).
- **Rule API-002**: Use HTTP methods representing CRUD actions:
  - `GET` for fetching resources. Should be safe and idempotent.
  - `POST` for creating resources. Non-idempotent.
  - `PUT` for fully replacing/updating resources.
  - `PATCH` for partial updates.
  - `DELETE` for removing resources.

## HTTP Response Standards
- **Rule API-003**: Return appropriate HTTP status codes for every response:
  - `200 OK` for successful fetches or updates.
  - `201 Created` for successful creation.
  - `400 Bad Request` for validation failures or malformed payload.
  - `401 Unauthorized` for missing or invalid authentication credentials.
  - `403 Forbidden` when authenticated but lacking permissions.
  - `404 Not Found` if the requested resource does not exist.
  - `429 Too Many Requests` when rate limits are exceeded.
  - `500 Internal Server Error` for unexpected backend issues.

## Payload Format
- **Rule API-004**: Always use JSON for request payloads and response bodies. Specify the header `Content-Type: application/json`.
- **Rule API-005**: Return camelCase keys in JSON responses.
- **Rule API-006**: Avoid raw array responses at the root level; wrap them in an object containing metadata if necessary:
  ```json
  {
    "items": [
      { "id": 1, "name": "Alice" }
    ],
    "count": 1
  }
  ```
