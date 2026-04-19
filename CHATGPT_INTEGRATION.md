# ChatGPT/OpenAI Integration Guide

This guide explains how to integrate the SOL Claimer MCP server with ChatGPT and OpenAI's platforms.

## Table of Contents

1. [OpenAI Custom Actions (ChatGPT Pro)](#openai-custom-actions-chatgpt-pro)
2. [OpenAI API Integration](#openai-api-integration)
3. [OpenAI Assistants API](#openai-assistants-api)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## OpenAI Custom Actions (ChatGPT Pro)

ChatGPT Pro users can create GPTs with custom actions that call the SOL Claimer API.

### Step 1: Prepare Your API

First, ensure the SOL Claimer API is publicly accessible (for production use):

Set the environment variable:
```bash
export SOLCLAIMER_API_URL=https://api.solclaimer.app
```

### Step 2: Create OpenAPI Schema

Create a file called `openapi.yaml` describing the API:

```yaml
openapi: 3.0.0
info:
  title: SOL Claimer API
  description: Analyze Solana token accounts and recover rent
  version: 1.0.0
servers:
  - url: https://api.solclaimer.app
    description: Production API

paths:
  /api/v1/accounts/analyze-empty:
    post:
      summary: Analyze empty token accounts
      description: Find empty token accounts in a wallet that can be closed to recover rent
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                walletAddress:
                  type: string
                  description: The Solana wallet address to analyze
                  example: "7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"
              required:
                - walletAddress
      responses:
        "200":
          description: Successful analysis
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      accountsToClose:
                        type: integer
                      totalSol:
                        type: number
                  timestamp:
                    type: string

  /api/v1/accounts/analyze-burnable:
    post:
      summary: Analyze burnable token accounts
      description: Find low-value tokens (<$1 USD) that can be burned and accounts closed
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                walletAddress:
                  type: string
                  description: The Solana wallet address to analyze
                  example: "7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"
              required:
                - walletAddress
      responses:
        "200":
          description: Successful analysis
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      accountsToBurn:
                        type: integer
                      totalSol:
                        type: number
                      totalUsdValue:
                        type: number
                      accountDetails:
                        type: array
                        items:
                          type: object
                          properties:
                            pubkey:
                              type: string
                            tokenName:
                              type: string
                            tokenSymbol:
                              type: string
                            usdValue:
                              type: number
                  timestamp:
                    type: string

  /api/v1/accounts/analyze-swappable:
    post:
      summary: Analyze swappable token accounts
      description: Find token accounts with amount > 0 that can be swapped and then closed
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                walletAddress:
                  type: string
                  description: The Solana wallet address to analyze
                  example: "7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"
              required:
                - walletAddress
      responses:
        "200":
          description: Successful analysis
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      accountsToSwap:
                        type: integer
                      totalSol:
                        type: number
                      totalUsdValue:
                        type: number
                      accountDetails:
                        type: array
                        items:
                          type: object
                          properties:
                            pubkey:
                              type: string
                            tokenName:
                              type: string
                            tokenSymbol:
                              type: string
                            usdValue:
                              type: number
                  timestamp:
                    type: string

  /api/v1/info/how-it-works:
    get:
      summary: Get SOL Claimer information
      description: Learn about SOL Claimer features and capabilities
      responses:
        "200":
          description: Feature information
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      title:
                        type: string
                      description:
                        type: string
                      features:
                        type: array
                  timestamp:
                    type: string
```

### Step 3: Create a GPT in ChatGPT

1. Go to [ChatGPT](https://chatgpt.com) (requires ChatGPT Plus or Team)
2. Click **"Explore"** in the sidebar, then click **"Create"** (or go directly to [chatgpt.com/create](https://chatgpt.com/create))
3. In the GPT Builder, switch to the **"Configure"** tab
4. Fill in the details:
  - **Name:** "SOL Claimer Analyzer"
  - **Description:** "Analyzes Solana wallets to identify empty token accounts and low-value tokens that can be closed to recover rent"
5. Add **Instructions:**
   ```
   You are a helpful assistant for the SOL Claimer tool. Help users analyze their Solana wallets to:
   1. Identify empty token accounts that can be closed to recover rent
   2. Find low-value tokens (<$1 USD) that can be burned to free up account space
   3. Find token balances that can be swapped and then closed
   4. Understand how much SOL can be recovered from these accounts
   
   When users provide a wallet address, use the available tools to analyze it and provide clear recommendations.
   ```
6. Scroll down to **"Actions"** section in the Configure tab
7. Click **"Create new action"**
8. In the Schema field, paste the OpenAPI schema from Step 2 above (update the server URL if needed)
9. Set **Authentication** to "None" (or configure API key if your API requires it)
10. Click **"Save"** to save your action

### Step 4: Share Your GPT

1. Click **"Create"** or **"Update"** in the top right
2. Choose your sharing option:
  - **"Only me"** - Private, for your use only
  - **"Anyone with a link"** - Share a link with specific people
  - **"Public"** - List in the GPT Store for anyone to find
3. Click **"Confirm"** to publish
4. Copy the link to share with others who want to use your SOL Claimer analyzer

---

## OpenAI API Integration

For programmatic access using the OpenAI API:

### Prerequisites

- OpenAI API key (from https://platform.openai.com/account/api-keys)
- Python 3.8+ or Node.js

### Python Example

```python
import openai
import requests
import json

openai.api_key = "your-api-key"

def analyze_wallet_with_gpt(wallet_address):
    """Analyze a Solana wallet using GPT-4 and SOL Claimer API."""
    
    # Define the tools
    tools = [
        {
            "type": "function",
            "function": {
                "name": "analyze_empty_accounts",
                "description": "Analyze a Solana wallet for empty token accounts that can be closed",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "wallet_address": {
                            "type": "string",
                            "description": "The Solana wallet address"
                        }
                    },
                    "required": ["wallet_address"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "analyze_burnable_accounts",
                "description": "Analyze a Solana wallet for low-value tokens that can be burned",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "wallet_address": {
                            "type": "string",
                            "description": "The Solana wallet address"
                        }
                    },
                    "required": ["wallet_address"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "analyze_swappable_accounts",
                "description": "Analyze a Solana wallet for token balances that can be swapped and closed",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "wallet_address": {
                            "type": "string",
                            "description": "The Solana wallet address"
                        }
                    },
                    "required": ["wallet_address"]
                }
            }
        }
    ]
    
    # Call GPT-4 with tools
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {
                "role": "user",
                "content": f"Analyze the Solana wallet {wallet_address}. Check for empty accounts, burnable tokens, and swappable token balances."
            }
        ],
        tools=tools,
        tool_choice="auto"
    )
    
    # Process tool calls
    while response.choices[0].message.tool_calls:
        tool_call = response.choices[0].message.tool_calls[0]
        
        if tool_call.function.name == "analyze_empty_accounts":
            result = requests.post(
                "https://api.solclaimer.app/api/v1/accounts/analyze-empty",
                json={"walletAddress": wallet_address}
            ).json()
        elif tool_call.function.name == "analyze_burnable_accounts":
            result = requests.post(
                "https://api.solclaimer.app/api/v1/accounts/analyze-burnable",
                json={"walletAddress": wallet_address}
            ).json()
        elif tool_call.function.name == "analyze_swappable_accounts":
            result = requests.post(
                "https://api.solclaimer.app/api/v1/accounts/analyze-swappable",
                json={"walletAddress": wallet_address}
            ).json()
        
        # Add tool result and continue
        response.messages.append({
            "role": "assistant",
            "content": str(result)
        })
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=response.messages,
            tools=tools,
            tool_choice="auto"
        )
    
    return response.choices[0].message.content

# Usage
result = analyze_wallet_with_gpt("7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri")
print(result)
```

### Node.js Example

```javascript
const OpenAI = require("openai");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeWalletWithGPT(walletAddress) {
  const tools = [
    {
      type: "function",
      function: {
        name: "analyze_empty_accounts",
        description:
          "Analyze a Solana wallet for empty token accounts that can be closed",
        parameters: {
          type: "object",
          properties: {
            wallet_address: {
              type: "string",
              description: "The Solana wallet address",
            },
          },
          required: ["wallet_address"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "analyze_burnable_accounts",
        description:
          "Analyze a Solana wallet for low-value tokens that can be burned",
        parameters: {
          type: "object",
          properties: {
            wallet_address: {
              type: "string",
              description: "The Solana wallet address",
            },
          },
          required: ["wallet_address"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "analyze_swappable_accounts",
        description:
          "Analyze a Solana wallet for token balances that can be swapped and closed",
        parameters: {
          type: "object",
          properties: {
            wallet_address: {
              type: "string",
              description: "The Solana wallet address",
            },
          },
          required: ["wallet_address"],
        },
      },
    },
  ];

  let messages = [
    {
      role: "user",
      content: `Analyze the Solana wallet ${walletAddress}. Check for empty accounts, burnable tokens, and swappable token balances.`,
    },
  ];

  let response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages,
    tools,
    tool_choice: "auto",
  });

  // Process tool calls
  while (response.choices[0].message.tool_calls) {
    const toolCall = response.choices[0].message.tool_calls[0];

    let result;
    if (toolCall.function.name === "analyze_empty_accounts") {
      const res = await axios.post(
        "https://api.solclaimer.app/api/v1/accounts/analyze-empty",
        { walletAddress }
      );
      result = JSON.stringify(res.data);
    } else if (toolCall.function.name === "analyze_burnable_accounts") {
      const res = await axios.post(
        "https://api.solclaimer.app/api/v1/accounts/analyze-burnable",
        { walletAddress }
      );
      result = JSON.stringify(res.data);
    } else if (toolCall.function.name === "analyze_swappable_accounts") {
      const res = await axios.post(
        "https://api.solclaimer.app/api/v1/accounts/analyze-swappable",
        { walletAddress }
      );
      result = JSON.stringify(res.data);
    }

    messages.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: result,
    });

    response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      tools,
      tool_choice: "auto",
    });
  }

  return response.choices[0].message.content;
}

// Usage
analyzeWalletWithGPT("7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri")
  .then(console.log)
  .catch(console.error);
```

---

## OpenAI Assistants API

For a persistent assistant that remembers conversation context:

```python
import openai

openai.api_key = "your-api-key"

# Create assistant
assistant = openai.Assistant.create(
    name="SOL Claimer Analyzer",
    description="Analyzes Solana wallets for empty accounts, low-value tokens, and swappable token balances",
    model="gpt-4-turbo",
    tools=[
        {
            "type": "function",
            "function": {
                "name": "analyze_empty_accounts",
                "description": "Analyze empty token accounts",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "wallet_address": {"type": "string"}
                    },
                    "required": ["wallet_address"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "analyze_burnable_accounts",
                "description": "Analyze burnable token accounts",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "wallet_address": {"type": "string"}
                    },
                    "required": ["wallet_address"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "analyze_swappable_accounts",
                "description": "Analyze swappable token accounts",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "wallet_address": {"type": "string"}
                    },
                    "required": ["wallet_address"]
                }
            }
        }
    ]
)

print(f"Created assistant: {assistant.id}")

# Create thread
thread = openai.Thread.create()
print(f"Created thread: {thread.id}")

# Add message
message = openai.Message.create(
    thread_id=thread.id,
    role="user",
    content="Analyze wallet 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"
)

# Run assistant
run = openai.Run.create(
    thread_id=thread.id,
    assistant_id=assistant.id
)

# Check results
messages = openai.Message.list(thread_id=thread.id)
for msg in messages:
    print(f"{msg.role}: {msg.content}")
```

---

## Testing

### Test Your Integration

```bash
# Test with curl
curl -X POST https://api.solclaimer.app/api/v1/accounts/analyze-empty \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"}'

# Expected response
{
  "success": true,
  "data": {
    "accountsToClose": 5,
    "totalSol": 0.0101964
  },
  "timestamp": "2026-02-28T03:00:00.000Z"
}
```

### Test in ChatGPT

If using custom actions in a GPT:

1. Open your SOL Claimer GPT
2. Ask: "Analyze wallet 7cvkjYAkUYs4W8XcXsca7cBrEGFeSUjeZmKoNBvEwyri"
3. The GPT should call the API and return results

---

## Troubleshooting

### Issue: "Unauthorized" or "Authentication failed"

**Solution:**
- Verify your OpenAI API key is correct
- Check that your account has API access enabled
- Ensure you have sufficient credits/quota

### Issue: Action not calling the API

**Solution:**
1. Check the OpenAPI schema is valid: use an [OpenAPI validator](https://validator.swagger.io/)
2. Verify the API endpoint is accessible from OpenAI's servers
3. Check API logs for errors: `curl -v https://api.solclaimer.app/api/v1/info/how-it-works`

### Issue: "Connection timeout"

**Solution:**
- Ensure outbound access to `https://api.solclaimer.app` from your environment
- Ensure firewall allows connections

### Issue: API response not parsed correctly

**Solution:**
1. Simplify the OpenAPI schema - remove unnecessary fields
2. Add `"description"` fields to all properties
3. Test with a simpler function first
4. Check that response format matches the schema

---

## Best Practices

1. **Rate Limiting**: Implement rate limiting on the MCP server for production
2. **Error Handling**: The API returns structured errors; display them clearly to users
3. **Validation**: Always validate wallet addresses before sending to the API
4. **Caching**: Cache results for frequently analyzed wallets
5. **User Consent**: Inform users this tool analyzes their blockchain data
6. **Documentation**: Provide users with the MCP documentation link

---

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for sensitive configuration
- Consider adding authentication to the SOL Claimer API in production
- For public APIs, implement rate limiting and CORS properly
- Log API calls for audit purposes

---

## More Help

- OpenAI API Docs: https://platform.openai.com/docs
- Function Calling: https://platform.openai.com/docs/guides/function-calling
- Assistants API: https://platform.openai.com/docs/assistants/overview
- SOL Claimer: https://solclaimer.app/
