# Husky Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality standards through Git hooks.

## Pre-commit Hook

The pre-commit hook automatically runs before every commit and performs the following checks:

### 1. Code Formatting 🎨

- Runs `npm run format` (Prettier) on all files
- If formatting changes any files, the commit is rejected
- You must stage the formatted files and commit again

### 2. Test Coverage 🧪

- Runs `npm run test:coverage` to execute all tests with coverage reporting
- Enforces coverage thresholds:
  - **Functions**: 95% minimum
  - **Lines/Statements/Branches**: 85% minimum
- Only covers the `src/utils` directory
- Commit is rejected if tests fail or coverage drops below thresholds

## Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass the pre-commit hook:

```bash
git commit --no-verify -m "your commit message"
```

**⚠️ Warning**: Only use `--no-verify` in emergency situations. The hooks are in place to maintain code quality and prevent broken code from entering the repository.

## Local Development

To run the same checks manually before committing:

```bash
# Run both formatting and tests (same as pre-commit)
npm run precommit

# Or run individually
npm run format
npm run test:coverage
```

## Troubleshooting

**Hook not running**: Ensure Husky is installed by running `npm install` after cloning the repository.

**Permission errors**: The hook files should be executable. If needed:

```bash
chmod +x .husky/pre-commit
```

**Coverage failures**: Check the coverage report in the `coverage/` directory to see which files need more tests.
