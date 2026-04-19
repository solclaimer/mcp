# Quick Start Guide

Get the SOL Claimer MCP server running in 5 minutes.

## 1. Build the Project

```bash
cd /Users/zouhairet-taousy/dev/solclaimer-mcp
npm install
npm run build
```

## 2. Verify Build

```bash
ls -la dist/index.js
# Should show the compiled JavaScript file
```

## 3. Start the SOL Claimer API

```bash
cd /path/to/solclaimer-api
# Set your environment variables
export SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
export MORALIS_API_KEY=your_key_here
npm run start:dev
```

The API should be running at `https://api.solclaimer.app`

## 4. Choose Your Integration

### Option A: Claude Desktop (Easiest)

1. Open `~/Library/Application\ Support/Claude/claude_desktop_config.json`
2. Add this configuration:

```json
{
  "mcpServers": {
    "solclaimer": {
      "command": "node",
      "args": ["/Users/zouhairet-taousy/dev/solclaimer-mcp/dist/index.js"],
      "env": {
        "SOLCLAIMER_API_URL": "https://api.solclaimer.app"
      }
    }
  }
}
```

3. Close and reopen Claude Desktop
4. Ask: "Analyze wallet 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"

### Option B: ChatGPT Custom GPT

1. Use the OpenAPI schema from [CHATGPT_INTEGRATION.md](./CHATGPT_INTEGRATION.md)
2. Create a custom GPT on [ChatGPT Plus](https://chat.openai.com)
3. Add the schema as an action
4. Share and use your custom GPT

## 5. Test the Tools

### Method 1: Direct API Call

```bash
curl -X POST https://api.solclaimer.app/api/v1/accounts/analyze-empty \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"}'
```

### Method 2: Claude Desktop

Ask Claude:
- "What tools do you have available?"
- "Analyze empty accounts for wallet 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"
- "Check for burnable tokens in wallet 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"
- "Check for swappable tokens in wallet 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"

## Available Tools

| Tool | Description | Input |
|------|-------------|-------|
| `analyze_empty_accounts` | Find empty accounts to close | Wallet address |
| `analyze_burnable_accounts` | Find low-value tokens (<$1) | Wallet address |
| `analyze_swappable_accounts` | Find tokens with amount > 0 to swap and close | Wallet address |
| `get_how_it_works` | Learn about SOL Claimer | None |

## Example Wallets

Use these for testing:
- `7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri`

## Environment Variables

```bash
# Optional - defaults to https://api.solclaimer.app
export SOLCLAIMER_API_URL=https://api.solclaimer.app
```

## Troubleshooting

**Tools not showing in Claude?**
- Check that `dist/index.js` exists
- Verify completely closed Claude (not just minimized)
- Check config file path
- Restart Claude

**API connection error?**
- Ensure SOL Claimer API is running
- Check: `curl https://api.solclaimer.app/api/v1/info/how-it-works`
- Verify `SOLCLAIMER_API_URL` environment variable

**Invalid wallet address?**
- Wallet must be 44 characters, base58 encoded
- Check for typos

## Next Steps

- Read [CLAUDE_INTEGRATION.md](./CLAUDE_INTEGRATION.md) for detailed Claude setup
- Read [CHATGPT_INTEGRATION.md](./CHATGPT_INTEGRATION.md) for ChatGPT integration
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Visit [SOL Claimer](https://solclaimer.app/) for more info

## Quick Command Reference

```bash
# Development
npm run dev

# Build
npm run build

# Format code
npm run format

# Lint
npm run lint
```

---

**Ready to go!** Choose your integration (Claude or ChatGPT) and start analyzing Solana wallets.
