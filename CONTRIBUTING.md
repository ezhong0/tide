# Contributing to Tide

First off, thank you for considering contributing to Tide! It's people like you that make Tide such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible using our bug report template.

**Great Bug Reports** tend to have:
- A quick summary and/or background
- Steps to reproduce (be specific!)
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please use the feature request template and include:
- Use case for the feature
- Expected behavior
- Current behavior
- Possible implementation

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these issues:
- Issues labeled `good-first-issue`
- Issues labeled `help-wanted`

## Development Process

### Setting Up Your Environment

1. Fork the repository
2. Clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/tide.git
   cd tide
   ```

3. Install dependencies
   ```bash
   pnpm install
   ```

4. Create a branch for your work
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. Make your changes in the appropriate packages/apps
2. Write or update tests as needed
3. Run tests to ensure everything passes
   ```bash
   pnpm test
   ```

4. Run linting and formatting
   ```bash
   pnpm lint
   pnpm format
   ```

5. Build the project
   ```bash
   pnpm build
   ```

### Project Structure

```
tide/
├── packages/          # Shared packages
│   ├── types/        # Core TypeScript types
│   ├── contracts/    # Service interfaces
│   ├── schemas/      # Zod validation schemas
│   └── mocks/        # Mock implementations
├── apps/             # Applications
│   ├── api/          # Backend API
│   ├── web/          # Web frontend
│   └── mobile/       # Mobile app
└── docs/             # Documentation
```

### Coding Standards

#### TypeScript
- Use TypeScript strict mode
- No `any` types (use `unknown` if necessary)
- Use branded types for domain concepts
- Prefer functional programming patterns
- Use `Result<T, E>` for error handling

#### Testing
- Write tests for all new functionality
- Maintain 80% code coverage minimum
- Use descriptive test names
- Include edge cases and error scenarios

#### Performance
- All operations should complete in <300ms
- Use appropriate caching strategies
- Optimize for offline-first operation
- Profile performance-critical code

#### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Keep functions small and focused
- Write clear, self-documenting code
- Add comments for complex logic

### Commit Messages

We follow conventional commits specification:

```
type(scope): description

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

Examples:
```
feat(email): add support for attachments
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
test(mocks): add tests for error scenarios
```

### Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features
3. Ensure all tests pass
4. Update the README.md if needed
5. Fill out the PR template completely
6. Request review from maintainers
7. Address review feedback promptly

### Review Criteria

PRs will be evaluated on:
- Code quality and clarity
- Test coverage
- Performance impact
- Documentation completeness
- Adherence to project standards

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific package tests
pnpm --filter @tide/mocks test

# Run performance tests
pnpm test:performance
```

### Writing Tests

- Place tests next to the code they test
- Use `.test.ts` suffix for test files
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test both success and failure cases

## Documentation

- Update JSDoc comments for public APIs
- Keep README files current
- Document breaking changes
- Include examples for complex features
- Update type definitions

## Release Process

We use semantic versioning (SemVer):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

Releases are automated through GitHub Actions when tags are pushed.

## Questions?

Feel free to open an issue with the label `question` if you need help or clarification.

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- Project documentation

Thank you for contributing to Tide! 🌊