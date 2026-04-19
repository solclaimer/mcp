# SOL Claimer MCP - Setup Instructions

## Project Status

This is a complete MCP (Model Context Protocol) server for the SOL Claimer API.

## Setup Checklist

- [x] Project structure scaffolded
- [x] TypeScript configuration created
- [x] Dependencies defined
- [ ] Dependencies installed
- [ ] Project compiled
- [ ] MCP configuration created
- [ ] Integration instructions provided

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Verify Build**
   The `dist/` folder should contain compiled JavaScript files.

4. **Create MCP Configuration** (see Integration section below)

## Integration with Claude/ChatGPT

### For Claude Desktop

1. **Create/Update Claude Settings**
   
   On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

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

2. **Ensure SOL Claimer API is Running**
   ```bash
   # In another terminal
   cd /path/to/solclaimer-api
   npm run start:dev
   ```

3. **Restart Claude Desktop** for the configuration to take effect

### For ChatGPT/Custom Integrations

Contact your AI platform provider for MCP server integration options. Generally:

1. Point to the compiled `dist/index.js` file
2. Configure the `SOLCLAIMER_API_URL` environment variable
3. The server will expose four tools available to the AI model

## Architecture Reference

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.

## Troubleshooting

**Problem:** MCP server not connecting
- Check that `dist/index.js` exists: `ls -la dist/`
- Verify Node.js version: `node --version` (should be 18+)
- Check API is running: `curl https://api.solclaimer.app/api/v1/info/how-it-works`

**Problem:** Tools not showing up in Claude
- Restart Claude Desktop completely
- Verify config file path and JSON syntax
- Check console logs for errors

**Problem:** API connection timeout
- Ensure SOL Claimer API is on port 3000
- Try: `curl https://api.solclaimer.app/api/v1/info/how-it-works`
- If running on different host/port, update `SOLCLAIMER_API_URL`

## Documentation

- **README.md** - User guide and feature overview
- **package.json** - Dependencies and build scripts
- **tsconfig.json** - TypeScript compiler configuration
- **src/index.ts** - Complete MCP server implementation

## Further Reading

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Integration Guide](https://claude.ai/)
