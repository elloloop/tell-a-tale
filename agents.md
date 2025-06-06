# Agent Development Guidelines

To ensure high-quality, maintainable, and collaborative development, all agents working in this repository must follow these practices:

## 1. Conventional Commits

- All commit messages **must** follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
- Example: `feat: add user authentication flow` or `fix: correct image loading bug`

## 2. Automated Testing

- Always run the full test suite before pushing or merging changes.
- Add or update tests for all new features and bug fixes.
- Ensure all tests pass locally and in CI before merging.

## 3. Code Quality & Linting

- Use linters and formatters (e.g., ESLint, Prettier) to maintain code consistency.
- Fix all lint and type errors before committing.

## 4. Pull Requests & Reviews

- Open a pull request for all changes, even minor ones.
- Request reviews from at least one other agent.
- Address all review comments before merging.

## 5. Documentation

- Update documentation (including this file) as needed when features, APIs, or workflows change.
- Document all public functions, components, and modules.

## 6. Automation & CI/CD

- Ensure CI/CD pipelines are green before merging.
- Automate repetitive tasks (testing, linting, formatting, deployment) where possible.

## 7. Security & Secrets

- Never commit secrets or sensitive data.
- Use environment variables and secret managers for credentials.

## 8. General Best Practices

- Write clear, concise, and self-explanatory code.
- Prefer small, focused commits and pull requests.
- Keep dependencies up to date and remove unused code.

---

**Agents are expected to uphold these standards to ensure a robust, scalable, and collaborative codebase.**
