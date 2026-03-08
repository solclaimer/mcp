## SOL Claimer MCP Server Architecture

This document describes the high-level architecture and design decisions for the SOL Claimer MCP server.

### Overview

The SOL Claimer MCP server acts as a bridge between Large Language Models (LLMs) like Claude and ChatGPT, and the SOL Claimer API. It exposes three tools that enable AI assistants to help users analyze Solana token accounts and recover rent.

### Components

#### 1. MCP Server (`index.ts`)

The main server implementation built on the official MCP TypeScript SDK. Responsible for:

- **Tool Registration**: Defines three tools with schemas
- **Request Handling**: Routes LLM tool calls to appropriate handlers
- **API Communication**: Interfaces with the SOL Claimer API
- **Response Formatting**: Converts structured API responses into readable text
- **Error Management**: Handles and reports API errors gracefully

#### 2. SolClaimerApiClient

A custom HTTP client that:

- Wraps the SOL Claimer REST API
- Handles authentication and timeouts
- Provides typed methods for each API endpoint
- Includes error boundaries for network issues

### Data Flow

```
LLM Application (Claude/ChatGPT)
        ↓
    MCP Server
        ↓
  Tool Handler
        ↓
SolClaimerApiClient
        ↓
SOL Claimer API
        ↓
Solana Network / Moralis
```

### Tool Definitions

#### Tool 1: analyze_empty_accounts

**Purpose**: Identify empty token accounts to recover rent

**Input Schema**:
- `wallet_address`: String (required) - Solana wallet address

**Process**:
1. Client calls MCP server with wallet address
2. MCP server calls `SolClaimerApiClient.analyzeEmptyAccounts()`
3. API returns account count and total SOL
4. MCP server formats response as readable text
5. Response returned to LLM

**Output Format**:
```
Empty Token Accounts Analysis
=============================
Accounts to Close: 5
Total SOL to Recover: 0.0101964 SOL
```

#### Tool 2: analyze_burnable_accounts

**Purpose**: Find low-value tokens (<$1) to burn and close

**Input Schema**:
- `wallet_address`: String (required) - Solana wallet address

**Process**:
1. Client calls MCP server with wallet address
2. MCP server calls `SolClaimerApiClient.analyzeBurnableAccounts()`
3. API analyzes accounts and fetches prices via Moralis
4. API returns detailed account information
5. MCP server formats each account with token details
6. Response returned to LLM

**Output Format**:
```
Burnable Token Accounts Analysis
=================================
Total Accounts to Burn: 12
Total SOL to Recover: 0.0244713 SOL
Total USD Value: $0.52

Accounts Details:
1. Example Token (EXPT)
   Mint: ...
   Amount: 1.0
   USD Value: $0.15
   ...
```

#### Tool 3: get_how_it_works

**Purpose**: Provide information about SOL Claimer features

**Input Schema**: None

**Process**:
1. Client calls MCP server
2. MCP server calls `SolClaimerApiClient.getHowItWorks()`
3. API returns feature documentation
4. MCP server formats as readable text
5. Response returned to LLM

### Error Handling

The MCP server implements multiple layers of error handling:

1. **Network Errors**: When API is unreachable
2. **API Errors**: When API returns error responses
3. **Validation Errors**: When required parameters are missing
4. **Formatting Errors**: When response structure is unexpected

All errors are caught and returned with `isError: true` flag for the LLM.

### Type Safety

The implementation uses TypeScript strict mode with:

- Explicit interface definitions for all API responses
- Type-safe API client methods
- Proper error typing with Error instances
- No implicit `any` types

### Configuration

The server reads configuration from environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `SOLCLAIMER_API_URL` | `http://localhost:3000` | SOL Claimer API base URL |

### Deployment Options

#### Local Development
```bash
npm run dev
# Runs with hot-reload via TypeScript watch mode
```

#### Production
```bash
npm run build
npm start
# Runs compiled JavaScript
```

#### With Claude Desktop
Configure in `~/.config/Claude/claude_desktop_config.json` (Linux) or equivalent on macOS/Windows.

### Dependencies

- **@modelcontextprotocol/sdk**: Official MCP TypeScript SDK for server implementation
- **axios**: HTTP client for API communication
- **typescript**: Language for type safety

### Performance Characteristics

- **Latency**: ~1-5 seconds per request (depends on API performance)
- **Timeout**: 30 seconds per API call
- **Memory**: Minimal (~50MB base footprint)
- **Concurrency**: Supports multiple simultaneous requests via Node.js event loop

### Security Considerations

1. **No Authentication**: MCP server expects secure transport (stdio/SSE)
2. **API Key Management**: API key managed by SOL Claimer API server
3. **Input Validation**: Solana address validation done by backend API
4. **Error Messages**: Safe error messages without credential leakage

### Future Enhancements

Potential improvements:

1. **Caching**: Add in-memory cache for frequent wallet analyses
2. **Batch Operations**: Support analyzing multiple wallets at once
3. **Real-time Monitoring**: Stream updates as analysis progresses
4. **Advanced Filtering**: Allow filtering burnable accounts by price range
5. **Transaction Building**: Generate actual transaction payloads for closing accounts
