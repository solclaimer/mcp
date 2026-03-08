# Publishing to npm

## Overview

This package uses automated versioning and publishing via GitHub Actions. The version starts at **1.0.0** and increments based on semantic versioning.

## Versioning Strategy

We use [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR** (1.x.x → 2.x.x): Breaking changes
- **MINOR** (1.0.x → 1.1.x): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## How to Publish

### Option 1: Automatic (Commit Message)

Push to `main` branch with a commit message indicating the version bump:

```bash
# Patch version (1.0.0 → 1.0.1)
git commit -m "fix: resolve API timeout issue"
git push origin main

# Minor version (1.0.0 → 1.1.0)
git commit -m "feat: add new tool [minor]"
git push origin main

# Major version (1.0.0 → 2.0.0)
git commit -m "feat!: breaking API changes [major]"
git push origin main
```

**Default**: If no `[major]` or `[minor]` is specified, it bumps the **patch** version.

### Option 2: Manual (GitHub Actions)

1. Go to **Actions** → **Release** workflow
2. Click **Run workflow**
3. Choose version bump type:
   - `patch` - 1.0.0 → 1.0.1
   - `minor` - 1.0.0 → 1.1.0
   - `major` - 1.0.0 → 2.0.0
4. Click **Run workflow**

### Option 3: Manual (CLI)

```bash
# Install the package first (one-time)
npm install

# Bump version and publish
npm version patch   # or minor, or major
git push origin main
git push --tags

# The GitHub Action will automatically publish to npm
```

## First-Time Setup

Before publishing, you need to configure npm authentication:

### 1. Create npm Access Token

1. Go to https://www.npmjs.com/
2. Log in to your account
3. Click your profile → **Access Tokens**
4. Click **Generate New Token** → **Classic Token**
5. Select **Automation** type
6. Copy the token (starts with `npm_...`)

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **Add secret**

### 3. Verify Package Name

Ensure the package name is available:

```bash
npm view @solclaimer/mcp
# Should return: npm ERR! code E404 (means available)
```

If taken, update `package.json`:
```json
{
  "name": "@your-org/solclaimer-mcp"
}
```

## Publishing Flow

```
Developer pushes code
        ↓
GitHub Actions triggered
        ↓
Run tests & build
        ↓
Bump version (1.0.0 → 1.0.1)
        ↓
Create git tag (v1.0.1)
        ↓
Create GitHub Release
        ↓
Publish to npm registry
        ↓
Users can install:
npm install @solclaimer/mcp@1.0.1
```

## Current Version

The current version is **1.0.0** (initial release).

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## Manual Publishing (Emergency)

If GitHub Actions fail, you can publish manually:

```bash
# 1. Ensure you're logged in to npm
npm login

# 2. Build the project
npm run build

# 3. Publish
npm publish --access public
```

## Troubleshooting

### "You must sign in to publish packages"

```bash
npm login
# Follow prompts to authenticate
```

### "Package name already exists"

Update `package.json` with a different name:
```json
{
  "name": "@your-username/solclaimer-mcp"
}
```

### "GitHub Actions workflow failed"

1. Check the **Actions** tab in your repository
2. View the failed workflow logs
3. Common issues:
   - Missing `NPM_TOKEN` secret
   - Invalid npm token
   - Package name already taken
   - Build errors

### "Version already published"

You can't republish the same version. Bump the version:

```bash
npm version patch
git push origin main --follow-tags
```

## Best Practices

1. **Always test locally before publishing**
   ```bash
   npm run build
   npm run lint
   ```

2. **Update CHANGELOG.md** with each release

3. **Use semantic versioning correctly**:
   - Patch: Bug fixes only
   - Minor: New features, no breaking changes
   - Major: Breaking changes

4. **Tag releases properly** in GitHub releases

5. **Keep documentation updated** with each version

## Installation for Users

After publishing, users can install via:

```bash
# Latest version
npm install @solclaimer/mcp

# Specific version
npm install @solclaimer/mcp@1.0.0

# Global installation
npm install -g @solclaimer/mcp
```

## Package Info

- **Registry**: https://registry.npmjs.org/
- **Package**: https://www.npmjs.com/package/@solclaimer/mcp
- **Repository**: https://github.com/solclaimer/mcp
- **Initial Version**: 1.0.0
- **License**: MIT

## Next Steps

1. ✅ Set up `NPM_TOKEN` in GitHub Secrets
2. ✅ Verify package name is available
3. 🔄 Push to `main` branch to trigger first publish
4. 🎉 Version 1.0.0 will be live on npm!
