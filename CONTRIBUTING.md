# Contributing to FlyFile

> **This project is developed with vibe coding using [Claude Code](https://github.com/anthropics/claude-code) by Anthropic**

First off, thank you for considering contributing to FlyFile! It's people like you that make FlyFile such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Be patient with newcomers
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, Node.js version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** and ensure the code follows our style guidelines
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/flyfile.git
cd flyfile

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure your local environment
# (You'll need Firebase credentials at minimum)

# Start development server
npm run dev
```

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any` when possible
- Use interfaces for object shapes
- Export types that are used across files

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow the existing component structure

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Use meaningful variable and function names
- Add comments for complex logic

### Commits

- Use clear, descriptive commit messages
- Reference issues in commits when applicable (`Fix #123`)
- Keep commits focused on a single change

Example commit messages:
```
feat: Add password strength indicator to registration
fix: Resolve file upload timeout for large files
docs: Update self-hosting guide with Redis configuration
refactor: Extract email templates to separate module
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── (auth)/         # Authentication pages
│   ├── (dashboard)/    # Protected dashboard pages
│   ├── api/            # API endpoints
│   └── ...
├── components/         # React components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
├── lib/               # Utility libraries
├── context/           # React Context providers
├── hooks/             # Custom React hooks
└── types/             # TypeScript type definitions
```

## Testing

Currently, we don't have automated tests, but we welcome contributions to add them! If you're adding tests:

- Place unit tests next to the files they test (`file.test.ts`)
- Use Jest for unit tests
- Use Playwright for E2E tests

## Documentation

- Update the README.md if you change functionality
- Update SELF_HOSTING.md if you change deployment requirements
- Add JSDoc comments to exported functions
- Keep code comments up to date

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

---

Thank you for contributing!
