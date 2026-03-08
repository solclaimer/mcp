# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-08

### Added
- Initial release of SOL Claimer MCP server
- Three tools for analyzing Solana wallets:
  - `analyze_empty_accounts` - Find empty token accounts to close
  - `analyze_burnable_accounts` - Find low-value tokens (<$1) to burn
  - `get_how_it_works` - Learn about SOL Claimer features
- Full TypeScript implementation with strict typing
- Comprehensive documentation:
  - Claude Desktop integration guide
  - ChatGPT/OpenAI integration guide
  - Architecture documentation
  - Quick start guide
- CI/CD workflows for automated testing and publishing
- Support for multiple Node.js versions (18.x, 20.x, 22.x)

### Features
- Connects to SOL Claimer REST API (http://localhost:3000)
- Type-safe API client with proper error handling
- Human-readable response formatting
- 30-second request timeout
- Graceful error management

[1.0.0]: https://github.com/solclaimer/mcp/releases/tag/v1.0.0
