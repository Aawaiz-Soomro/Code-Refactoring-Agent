# Security Best Practices Guidelines

## SQL Injection Prevention
- **Rule SEC-001**: Never use string interpolation, concatenation, or format strings to construct SQL queries with user input.
- **Rule SEC-002**: Always use parameterized queries (prepared statements) with placeholders (e.g., `%s` in psycopg2, `$1, $2` in pg, `?` in sqlite).
- **Correct Example**:
  ```python
  cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
  ```
- **Incorrect Example**:
  ```python
  cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
  ```

## Secrets and Key Management
- **Rule SEC-003**: Do not hardcode API keys, passwords, database credentials, tokens, or encryption keys in the codebase.
- **Rule SEC-004**: Retrieve credentials from environment variables or a secure vault at runtime.
- **Rule SEC-005**: Ensure `.env` or configuration files containing credentials are added to `.gitignore`.

## Cryptography and Hashing
- **Rule SEC-006**: Never use weak or deprecated algorithms like MD5, SHA-1, or plain crypt for hashing passwords or sensitive tokens.
- **Rule SEC-007**: Always use strong, modern password hashing functions like bcrypt, Argon2, or PBKDF2 with adequate salt/work factors.

## Input Sanitization and XSS Prevention
- **Rule SEC-008**: Always validate and sanitize user inputs before returning them in web responses or parsing them.
- **Rule SEC-009**: Escape HTML and characters that could trigger cross-site scripting (XSS).
