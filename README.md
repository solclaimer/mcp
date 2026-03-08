# SOL Claimer MCP Server

A Model Context Protocol (MCP) server that provides seamless integration between LLM applications (ChatGPT, Claude, etc.) and the SOL Claimer API. This server enables AI assistants to analyze Solana token accounts and help users recover rent from empty and low-value token accounts.

## Features

- ✅ **Three Powerful Tools**:
  1. **analyze_empty_accounts** - Find and recover rent from empty token accounts
  2. **analyze_burnable_accounts** - Identify low-value tokens (<$1) to burn and close
  3. **get_how_it_works** - Learn about SOL Claimer functionality

- 🔄 **Real-time API Integration** - Direct connection to SOL Claimer API
- 🛡️ **Error Handling** - Graceful error management and user-friendly messages
- 📊 **Rich Response Formatting** - Detailed, readable analysis results

## Prerequisites

- Node.js 18+ (tested on v20+)
- npm 10+
- SOL Claimer API running locally or accessible via network
- Environment variable `SOLCLAIMER_API_URL` (optional, defaults to http://localhost:3000)

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Configuration

### Environment Variables

Optionally set the SOL Claimer API URL:

```bash
export SOLCLAIMER_API_URL=http://localhost:3000
```

If not set, defaults to `http://localhost:3000`.

## Development

```bash
# Watch TypeScript changes and run
npm run dev

# Format code
npm run format

# Lint code
npm run lint
```

## Tools

### 1. analyze_empty_accounts

Analyzes a Solana wallet for empty token accounts that can be closed to recover rent.

**Parameters:**
- `wallet_address` (string, required): The Solana wallet address to analyze

**Response:**
- `accountsToClose` - Number of empty accounts found
- `totalSol` - Total SOL available for recovery

### 2. analyze_burnable_accounts

Analyzes a wallet for token accounts with balances worth less than $1 USD that can be burned and closed.

**Parameters:**
- `wallet_address` (string, required): The Solana wallet address to analyze

**Response:**
- `accountsToBurn` - Number of burnable accounts found
- `totalSol` - Total SOL available for recovery
- `totalUsdValue` - Combined USD value of all burnable tokens
- `accountDetails` - Array of detailed account information including:
  - Token name and symbol
  - Amount and USD value
  - Rent (in lamports)
  - Contract verification status

### 3. get_how_it_works

Returns documentation about SOL Claimer features and capabilities.

**Parameters:** None

**Response:**
- Information about SOL Claimer features
- Description of how it works
- Website link

## Example Usage with Claude

```
User: "Can you analyze my Solana wallet at 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri?"

Claude: [Uses analyze_empty_accounts and analyze_burnable_accounts tools]
"Based on the analysis, I found:
- 5 empty token accounts: 0.0101964 SOL can be recovered
- 12 burnable accounts: 0.0244713 SOL can be recovered (worth $0.52)
..."
```

## Integration with LLM Platforms

### Claude (via claude.ai or Claude API)

1. Create a Claude project with this MCP server
2. Configure the MCP server in your Claude settings
3. Claude will automatically use the available tools when analyzing Solana wallets

### ChatGPT / OpenAI

1. Set up a custom integration pointing to this MCP server
2. Configure as a tool/action in your OpenAI integration
3. Use natural language to analyze wallets

### Generic MCP Client Integration

Any MCP-compatible client can connect to this server using:

```json
{
  "mcpServers": {
    "solclaimer": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "SOLCLAIMER_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Architecture

### Project Structure

```
src/
├── index.ts          # Main MCP server implementation
tsconfig.json         # TypeScript configuration
package.json          # Dependencies and scripts
```

### Key Components

1. **SolClaimerApiClient** - Handles communication with the SOL Claimer API
2. **MCP Server** - Exposes three tools via the Model Context Protocol
3. **Response Formatters** - Transform API responses into readable text

## Troubleshooting

### Connection refused error
- Ensure SOL Claimer API is running on the configured `SOLCLAIMER_API_URL`
- Default: http://localhost:3000
- Check firewall and port accessibility

### Invalid wallet address
- Verify the Solana wallet address format (44-character base58 string)
- Examples: `7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri`

### API timeout
- Check network connectivity to the SOL Claimer API
- Increase timeout if API is slow (edit timeout in SolClaimerApiClient)
- Check if Solana RPC endpoint is accessible

## Performance

- Requests include 30-second timeout to prevent hanging
- No caching at MCP layer (respects API caching)
- Suitable for real-time analysis

## License

UNLICENSED

## Links

- **SOL Claimer Website**: https://solclaimer.app/
- **Model Context Protocol**: https://modelcontextprotocol.io/
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
