# Release Process

This document outlines the standardized release process for `@scottluskcis/outport`.

## Pre-Release Checklist

Before creating a release, ensure all of the following are complete:

### 1. Ensure All Changes Are Merged

```bash
git checkout main
git pull origin main
```

### 2. Run Release Check

This validates that your code is ready for release:

```bash
pnpm run release:check
```

This command runs:

- ✅ Type checking (`typecheck`)
- ✅ Linting (`lint`)
- ✅ Format checking (`format:check`)
- ✅ Build process (`build`)
- ✅ All tests (`test`)

**All checks must pass before proceeding.**

### 3. Update CHANGELOG.md

Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:

1. **Move items from `[Unreleased]` to new version section**
2. **Add the version number and date**:
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD
   ```
3. **Organize changes by category**:
   - **Added** - New features
   - **Changed** - Changes in existing functionality
   - **Deprecated** - Soon-to-be removed features
   - **Removed** - Removed features
   - **Fixed** - Bug fixes
   - **Security** - Security improvements
4. **Update comparison links at bottom of file**:
   ```markdown
   [unreleased]: https://github.com/scottluskcis/outport/compare/vX.Y.Z...HEAD
   [x.y.z]: https://github.com/scottluskcis/outport/compare/vX.Y.Z-1...vX.Y.Z
   ```

Example:

```markdown
## [Unreleased]

## [0.0.7] - 2025-10-22

### Added

- New feature X
- Improvement to feature Y

### Fixed

- Bug fix for issue #123

[unreleased]: https://github.com/scottluskcis/outport/compare/v0.0.7...HEAD
[0.0.7]: https://github.com/scottluskcis/outport/compare/v0.0.6...v0.0.7
```

### 4. Commit Changelog

```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for vX.Y.Z"
git push origin main
```

## Release Steps

### 1. Bump Version

Use npm's built-in version command to update [`package.json`](../package.json) and create a git tag:

```bash
# For bug fixes (0.0.6 → 0.0.7)
npm version patch

# For new features (0.0.6 → 0.1.0)
npm version minor

# For breaking changes (0.0.6 → 1.0.0)
npm version major
```

This command:

- Updates the `version` field in [`package.json`](../package.json)
- Creates a git commit with the message "X.Y.Z"
- Creates a git tag `vX.Y.Z`

### 2. Push Changes with Tags

```bash
git push && git push --tags
```

This pushes:

- The version bump commit
- The new version tag

### 3. Create GitHub Release

1. **Navigate to Releases**:
   - Go to: https://github.com/scottluskcis/outport/releases/new

2. **Select the Tag**:
   - Choose the tag you just created (e.g., `v0.0.7`)

3. **Set Release Title**:
   - Format: `vX.Y.Z` (e.g., `v0.0.7`)

4. **Add Release Description**:
   - Copy the relevant section from [`CHANGELOG.md`](../CHANGELOG.md)
   - Format it nicely for GitHub (supports Markdown)

5. **Publish Release**:
   - Click **"Publish release"**
   - This triggers the automated npm publishing workflow

### 4. Monitor Workflow

1. **Watch the GitHub Action**:
   - Go to: https://github.com/scottluskcis/outport/actions
   - Look for "Publish to npm" workflow
   - Ensure it completes successfully

2. **Check for Errors**:
   - Green checkmark ✅ = Success
   - Red X ❌ = Failure (check logs)

### 5. Verify Publication

After the workflow completes:

1. **Check npm Registry**:

   ```bash
   npm view @scottluskcis/outport
   ```

   Should show the new version.

2. **Visit npm Package Page**:
   - Go to: https://www.npmjs.com/package/@scottluskcis/outport
   - Verify the new version is listed
   - Check for the provenance badge (🔒 verified)

3. **Test Installation**:

   ```bash
   npm install @scottluskcis/outport@latest
   ```

   Or in a test project:

   ```bash
   mkdir test-install && cd test-install
   npm init -y
   npm install @scottluskcis/outport
   node -e "console.log(require('@scottluskcis/outport'))"
   ```

## Post-Release

### 1. Verify Package Contents

Check what was actually published:

```bash
npm pack @scottluskcis/outport@latest --dry-run
```

This shows the files included in the published package.

### 2. Update Documentation (if needed)

If the release includes API changes:

- Update README.md examples
- Update documentation in `docs/` folder
- Update JSDoc comments if needed

### 3. Announce the Release

Consider announcing on:

- GitHub Discussions
- Twitter/X
- Dev.to or other developer communities
- Your blog

## Semantic Versioning Guide

Follow [Semantic Versioning 2.0.0](https://semver.org/):

### MAJOR Version (X.0.0)

Increment when you make **incompatible API changes**:

- Removing public APIs
- Changing function signatures
- Breaking existing functionality

**Example**: Removing `outport().toFile()` method

### MINOR Version (0.X.0)

Increment when you add **functionality in a backward-compatible manner**:

- Adding new features
- Adding new methods
- Adding optional parameters

**Example**: Adding XML export support

### PATCH Version (0.0.X)

Increment when you make **backward-compatible bug fixes**:

- Fixing bugs
- Performance improvements
- Documentation updates

**Example**: Fixing CSV escaping issue

## Troubleshooting

### Release Check Fails

**Problem**: `pnpm run release:check` shows errors

**Solution**:

1. Fix the errors shown
2. Commit and push fixes
3. Run `release:check` again

### GitHub Workflow Fails

**Problem**: "Publish to npm" workflow fails in Actions

**Common Causes**:

1. **Authentication Error**:
   - Verify `NPM_TOKEN` secret is set correctly
   - Ensure token has "Read and write" permissions for `@scottluskcis/outport`
   - Check token hasn't expired

2. **Version Already Published**:
   - npm doesn't allow republishing the same version
   - Bump to a new version

3. **CI Checks Fail**:
   - Tests failing
   - Linting errors
   - Format check failures
   - Fix locally and re-release

### Wrong Version Published

**Problem**: Published wrong version number

**Solution (within 72 hours)**:

```bash
# Unpublish the incorrect version (use sparingly!)
npm unpublish @scottluskcis/outport@X.Y.Z

# Publish the correct version
npm version patch
git push && git push --tags
# Create new GitHub release
```

**⚠️ Warning**: Unpublishing is discouraged. Consider publishing a corrected version instead.

### Need to Rollback

**Problem**: Critical bug in latest release

**Recommended Approach**:

1. **Publish a fixed patch version** (preferred):

   ```bash
   # Fix the bug
   npm version patch
   git push && git push --tags
   # Create new release
   ```

2. **Deprecate the broken version**:
   ```bash
   npm deprecate @scottluskcis/outport@X.Y.Z "Critical bug, please upgrade to X.Y.Z+1"
   ```

## Emergency Contacts

- **npm Support**: https://www.npmjs.com/support
- **GitHub Support**: https://support.github.com/

## Helpful Commands

```bash
# Check what would be published
npm pack --dry-run

# View package info on npm
npm view @scottluskcis/outport

# View specific version
npm view @scottluskcis/outport@X.Y.Z

# List all published versions
npm view @scottluskcis/outport versions

# Check latest version
npm view @scottluskcis/outport version

# Test package in a temporary directory
mkdir /tmp/test-outport && cd /tmp/test-outport
npm init -y
npm install @scottluskcis/outport
```

## Release Frequency

Recommended cadence:

- **Patch releases**: As needed for bug fixes
- **Minor releases**: When new features are ready (every 2-4 weeks)
- **Major releases**: Only when necessary (breaking changes)

## Conclusion

Following this process ensures:

- ✅ Quality releases (all checks pass)
- ✅ Proper versioning (semantic versioning)
- ✅ Complete documentation (changelog)
- ✅ Automated publishing (GitHub Actions)
- ✅ Verified packages (npm provenance)

Happy releasing! 🚀
