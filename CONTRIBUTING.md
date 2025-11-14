# Contributing to Daily Hisab

Thank you for considering contributing to Daily Hisab! 🎉

## Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Focus on constructive feedback
- Welcome newcomers

## How to Contribute

### Reporting Bugs

1. Check if the bug already exists in [Issues](https://github.com/yourusername/daily-hisab-app/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear use case description
   - Why it would be valuable
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/daily-hisab-app.git
   cd daily-hisab-app
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

3. **Follow TDD approach**
   - Write failing tests first
   - Implement the feature
   - Make tests pass
   - Refactor if needed

4. **Write tests**
   - Unit tests for utilities and services
   - Component tests for UI
   - E2E tests for critical flows

5. **Follow code style**
   ```bash
   npm run lint
   ```

6. **Commit with clear messages**
   ```bash
   git commit -m "feat: add transaction export feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation
   - `style:` formatting
   - `refactor:` code restructuring
   - `test:` adding tests
   - `chore:` maintenance

7. **Push and create PR**
   ```bash
   git push origin feature/my-awesome-feature
   ```

## Development Workflow

### 1. Setup Development Environment

```bash
npm install
cp .env.example .env
# Configure .env
npm run db:push
npm run db:seed
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Run Tests

```bash
# Watch mode for TDD
npm test -- --watch

# Run all tests
npm test

# E2E tests
npm run test:e2e
```

### 4. Check Code Quality

```bash
# Linting
npm run lint

# Type checking (automatic with TypeScript)
```

## Testing Guidelines

### Unit Tests

Location: `tests/unit/`

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/utils';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Component Tests

Location: `tests/unit/components/`

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests

Location: `tests/e2e/`

```typescript
import { test, expect } from '@playwright/test';

test('user can create transaction', async ({ page }) => {
  await page.goto('/dashboard');
  // ... test steps
});
```

## Code Style

- Use TypeScript for type safety
- Follow Next.js 14 conventions
- Use functional components with hooks
- Prefer async/await over promises
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
│   ├── ui/          # Base UI components
│   └── ...          # Feature components
├── lib/             # Utilities and services
├── hooks/           # Custom React hooks
├── types/           # TypeScript types
└── i18n/            # Translations
```

## Translation Guidelines

When adding new features with text:

1. Add English text to `src/i18n/messages/en.json`
2. Add Bangla translation to `src/i18n/messages/bn.json`
3. Use translation keys in components

Example:
```typescript
// Instead of hardcoding:
<button>Add Transaction</button>

// Use translation:
<button>{t('transaction.addTransaction')}</button>
```

## Database Changes

When modifying the database schema:

1. Update `prisma/schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name descriptive_name
   ```
3. Update seed file if needed
4. Document changes in PR

## UI/UX Guidelines

- Mobile-first approach
- Support both dark and light themes
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test on multiple devices
- Follow existing design patterns
- Use shadcn/ui components when possible

## Documentation

- Update README.md for major features
- Add JSDoc comments for complex functions
- Update SETUP_GUIDE.md if setup changes
- Include screenshots for UI changes

## Review Process

1. Automated checks must pass:
   - Tests
   - Linting
   - Type checking

2. Code review by maintainers:
   - Code quality
   - Test coverage
   - Documentation
   - Performance impact

3. Address feedback and update PR

4. Approval and merge

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in commit history

## Questions?

Feel free to:
- Open a discussion
- Ask in PR comments
- Reach out to maintainers

Thank you for contributing! 🙏

