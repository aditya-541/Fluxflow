# Contributing to FluxFlow

Thank you for your interest in contributing to FluxFlow! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the [existing issues](https://github.com/yourusername/fluxflow/issues)
2. Ensure you're using the latest version
3. Collect relevant information (OS, versions, error messages)

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS 17, Android 13]
- App Version: [e.g. 1.0.0]
- Device: [e.g. iPhone 14, Pixel 7]
```

### Suggesting Features

Feature requests are welcome! Please:
1. Check if the feature has already been requested
2. Explain the use case and benefits
3. Be open to discussion and feedback

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guidelines
   - Add tests for new features
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Frontend
   cd frontend && npm test
   
   # Backend
   cd backend/functions && npm test
   
   # ML Service
   cd ml-service && pytest
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide a clear description
   - Reference related issues
   - Include screenshots for UI changes

## Development Setup

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

## Code Style

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for public APIs

**Example:**
```typescript
/**
 * Create a new task for the current user
 * @param taskData - Task details
 * @returns Promise resolving to task ID
 * @throws Error if user not authenticated
 */
export const createTask = async (taskData: CreateTaskData): Promise<string> => {
  // Implementation
};
```

### Python

- Follow PEP 8 style guide
- Use type hints
- Add docstrings for functions
- Keep functions focused and small

**Example:**
```python
def predict_schedule(
    tasks: List[Task],
    energy_level: int
) -> List[ScheduledTask]:
    """
    Generate optimized schedule based on tasks and energy.
    
    Args:
        tasks: List of tasks to schedule
        energy_level: Current energy level (1-10)
        
    Returns:
        List of scheduled tasks with time slots
    """
    # Implementation
```

## Testing Guidelines

### Frontend Tests

- Test user interactions
- Mock external dependencies
- Test error scenarios
- Aim for >80% coverage

### Backend Tests

- Test Cloud Functions
- Mock Firebase services
- Test security rules
- Test edge cases

### ML Service Tests

- Test all endpoints
- Test validation
- Test algorithm correctness
- Test error handling

## Documentation

- Update README.md for major changes
- Update API.md for API changes
- Add inline comments for complex logic
- Update ARCHITECTURE.md for design changes

## Review Process

1. **Automated Checks**
   - All tests must pass
   - Linting must pass
   - Build must succeed

2. **Code Review**
   - At least one maintainer approval required
   - Address all review comments
   - Keep discussions professional

3. **Merge**
   - Squash commits if needed
   - Update changelog
   - Delete feature branch after merge

## Release Process

1. Update version in `package.json` and `app.json`
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production
5. Create GitHub release with notes

## Getting Help

- **Questions:** Open a GitHub Discussion
- **Bugs:** Open a GitHub Issue
- **Chat:** Join our Discord (if available)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the app (for significant contributions)

Thank you for contributing to FluxFlow! 🎉
