# Claude Integration Guide

This guide explains how to set up and use the SOL Claimer MCP server with Claude (both Claude Desktop and Claude API).

## Table of Contents

1. [Claude Desktop Integration](#claude-desktop-integration)
2. [Claude API Integration](#claude-api-integration)
3. [Testing the Integration](#testing-the-integration)
4. [Troubleshooting](#troubleshooting)

---

## Claude Desktop Integration

Claude Desktop is the easiest way to use this MCP server.

### Prerequisites

- Claude Desktop application installed ([download here](https://claude.ai/download))
- Node.js 18+ installed
- SOL Claimer API running locally or accessible via network

### Step 1: Build the MCP Server

First, ensure the MCP server is built:

```bash
cd /Users/zouhairet-taousy/dev/solclaimer-mcp
npm install
npm run build
```

Verify the build was successful:

```bash
ls -la dist/index.js
```

### Step 2: Locate Claude Configuration File

Find your Claude configuration file:

**On macOS:**
```bash
~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**On Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**On Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 3: Update Claude Configuration

Open the configuration file in your preferred editor and add the SOL Claimer MCP server:

```json
{
  "mcpServers": {
    "solclaimer": {
      "command": "node",
      "args": ["/Users/zouhairet-taousy/dev/solclaimer-mcp/dist/index.js"],
      "env": {
        "SOLCLAIMER_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

**Important:** Update the path `/Users/zouhairet-taousy/dev/solclaimer-mcp/dist/index.js` to match your actual installation path.

### Step 4: Ensure SOL Claimer API is Running

In a separate terminal, start the SOL Claimer API:

```bash
cd /path/to/solclaimer-api
npm run start:dev
```

The API should be accessible at `http://localhost:3000`.

### Step 5: Restart Claude Desktop

Completely close Claude Desktop (not just minimize) and reopen it. The MCP server will initialize automatically.

### Step 6: Verify Integration

In Claude Desktop, you should now see:
- Three new tools available: `analyze_empty_accounts`, `analyze_burnable_accounts`, and `get_how_it_works`
- These will appear in the tools panel when appropriate

Try asking Claude:
```
Can you analyze my Solana wallet at 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri?
```

---

## Claude API Integration

For programmatic use of Claude with the MCP server:

### Option 1: Using Anthropic SDK with MCP

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import * as path from "path";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Start the MCP server
const serverPath = "/Users/zouhairet-taousy/dev/solclaimer-mcp/dist/index.js";
const serverProcess = spawn("node", [serverPath], {
  env: {
    ...process.env,
    SOLCLAIMER_API_URL: "http://localhost:3000",
  },
});

// Use Claude with MCP tools
async function analyzeWallet(walletAddress: string) {
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    tools: [
      {
        name: "analyze_empty_accounts",
        description:
          "Analyze a Solana wallet for empty token accounts that can be closed to recover rent.",
        input_schema: {
          type: "object",
          properties: {
            wallet_address: {
              type: "string",
              description: "The Solana wallet address to analyze",
            },
          },
          required: ["wallet_address"],
        },
      },
      {
        name: "analyze_burnable_accounts",
        description:
          "Analyze a Solana wallet for token accounts with low value (<$1) that can be burned.",
        input_schema: {
          type: "object",
          properties: {
            wallet_address: {
              type: "string",
              description: "The Solana wallet address to analyze",
            },
          },
          required: ["wallet_address"],
        },
      },
      {
        name: "get_how_it_works",
        description: "Get information about SOL Claimer features.",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Please analyze the Solana wallet ${walletAddress} and tell me what accounts can be closed and what tokens can be burned.`,
      },
    ],
  });

  return response;
}

// Clean up
process.on("exit", () => {
  serverProcess.kill();
});
```

### Option 2: Direct HTTP Integration

If you prefer direct HTTP requests to the API:

```typescript
async function analyzeWalletDirect(walletAddress: string) {
  // Empty accounts
  const emptyResponse = await fetch(
    "http://localhost:3000/api/v1/accounts/analyze-empty",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    }
  );

  // Burnable accounts
  const burnableResponse = await fetch(
    "http://localhost:3000/api/v1/accounts/analyze-burnable",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    }
  );

  const empty = await emptyResponse.json();
  const burnable = await burnableResponse.json();

  return { empty, burnable };
}
```

---

## Testing the Integration

### Test 1: Simple Query

Ask Claude:
```
What tools do you have available?
```

Claude should list the three SOL Claimer tools.

### Test 2: Analyze Empty Accounts

Ask Claude:
```
Analyze empty accounts for wallet 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri
```

Expected response: Claude calls the `analyze_empty_accounts` tool and reports back with the number of empty accounts and SOL available.

### Test 3: Analyze Burnable Accounts

Ask Claude:
```
Check for low-value tokens in wallet 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri
```

Expected response: Claude calls `analyze_burnable_accounts` and provides detailed account information.

### Test 4: How It Works

Ask Claude:
```
How does SOL Claimer work?
```

Claude will call `get_how_it_works` and explain the features.

---

## Troubleshooting

### Issue: Tools not appearing in Claude

**Solution:**
1. Verify `dist/index.js` exists: `ls -la dist/index.js`
2. Check the configuration file path is correct for your OS
3. Verify the JSON syntax: `cat claude_desktop_config.json | python -m json.tool`
4. Full close Claude Desktop (Command+Q on macOS)
5. Reopen Claude Desktop
6. Check Claude logs: `~/Library/Application\ Support/Claude/logs/`

### Issue: "Connection refused" error

**Solution:**
1. Ensure SOL Claimer API is running: `curl http://localhost:3000/api/v1/info/how-it-works`
2. If running on different host/port, update `SOLCLAIMER_API_URL` in the config
3. Check firewall settings allow port 3000

### Issue: "Invalid wallet address" error

**Solution:**
- Ensure the wallet address is a valid 44-character base58 string
- Example valid address: `7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri`

### Issue: API timeout errors

**Solution:**
1. Check SOL Claimer API logs for errors
2. Verify Solana RPC endpoint is accessible
3. For production, use a premium RPC provider (Helius, QuickNode)

### Issue: "TypeError: StdioServerTransport is not a constructor"

**Solution:**
- Ensure Node.js version is 18+: `node --version`
- Rebuild the project: `npm run build`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

---

## Configuration Options

| Environment Variable | Default | Description |
|---|---|---|
| `SOLCLAIMER_API_URL` | `http://localhost:3000` | SOL Claimer API base URL |

### Example: Using a Remote API

Update your Claude config:

```json
{
  "mcpServers": {
    "solclaimer": {
      "command": "node",
      "args": ["/Users/zouhairet-taousy/dev/solclaimer-mcp/dist/index.js"],
      "env": {
        "SOLCLAIMER_API_URL": "https://api.example.com/solclaimer"
      }
    }
  }
}
```

---

## Advanced: Custom Server Wrapping

If you need custom behavior, create a wrapper script:

```bash
#!/bin/bash
export SOLCLAIMER_API_URL=${SOLCLAIMER_API_URL:-http://localhost:3000}
export NODE_OPTIONS="--enable-source-maps"
node /Users/zouhairet-taousy/dev/solclaimer-mcp/dist/index.js
```

Save as `/usr/local/bin/solclaimer-mcp` and update config:

```json
{
  "mcpServers": {
    "solclaimer": {
      "command": "/usr/local/bin/solclaimer-mcp"
    }
  }
}
```

---

## More Help

- Claude Documentation: https://claude.ai/docs
- MCP Documentation: https://modelcontextprotocol.io/
- SOL Claimer: https://solclaimer.app/
